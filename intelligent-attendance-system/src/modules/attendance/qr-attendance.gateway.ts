import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QrSecurityService } from './qr-security.service';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { ClassSession, ClassSessionDocument } from '../academic/course-section/schemas/class-session.schema';
import { Enrollment, EnrollmentDocument } from '../academic/student/schemas/enrollment.schema';

/**
 * WebSocket Gateway cho phân hệ Điểm danh bằng Mã QR Động
 * Namespace: /attendance-qr
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/attendance-qr',
})
export class QrAttendanceGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QrAttendanceGateway.name);

  // Quản lý các bộ Timer interval đang chạy theo từng ClassSession
  private activeTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly qrSecurityService: QrSecurityService,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  afterInit(server: Server) {
    this.logger.log('QrAttendanceGateway initialized on namespace /attendance-qr');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to /attendance-qr: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from /attendance-qr: ${client.id}`);
  }

  /**
   * Truy vấn và gửi toàn bộ dữ liệu điểm danh ban đầu của buổi học (số lượng + danh sách SV đã điểm danh)
   */
  async sendInitialStats(target: Socket | string, classSessionId: string) {
    try {
      if (!Types.ObjectId.isValid(classSessionId)) return;
      const session = await this.classSessionModel.findById(classSessionId);
      if (!session) return;

      const courseSectionId = session.courseSectionId;
      const [totalStudents, attendances] = await Promise.all([
        this.enrollmentModel.countDocuments({ courseSectionId, status: 'enrolled' }),
        this.attendanceModel
          .find({
            classSessionId: new Types.ObjectId(classSessionId),
            checkInTime: { $ne: null },
          })
          .populate('studentId', 'fullName userCode avatarUrl email')
          .sort({ checkInTime: -1 })
          .limit(50)
          .lean(),
      ]);

      const recentCheckIns = attendances.map((att: any) => ({
        studentId: att.studentId?._id?.toString() || att.studentId?.toString(),
        studentCode: att.studentId?.userCode || 'N/A',
        fullName: att.studentId?.fullName || 'Sinh viên',
        avatar: att.studentId?.avatarUrl || null,
        checkInTime: att.checkInTime,
        status: att.status || 'present',
        presentCount: attendances.length,
        totalStudents,
      }));

      const payload = {
        classSessionId,
        presentCount: attendances.length,
        totalStudents,
        recentCheckIns,
      };

      if (typeof target === 'string') {
        this.server.to(target).emit('session_initial_stats', payload);
      } else {
        target.emit('session_initial_stats', payload);
      }
      this.logger.log(`Sent initial stats for session ${classSessionId}: ${attendances.length}/${totalStudents} students`);
    } catch (err: any) {
      this.logger.warn(`Failed to send initial stats: ${err?.message}`);
    }
  }

  /**
   * Giảng viên mở màn hình máy chiếu và yêu cầu bắt đầu phát mã QR động
   * Client emit: 'start_qr_stream' kèm { classSessionId, intervalSec }
   */
  @SubscribeMessage('start_qr_stream')
  async handleStartQrStream(
    @MessageBody() data: { classSessionId: string; intervalSec?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { classSessionId, intervalSec = 20 } = data;
    if (!classSessionId) {
      return { success: false, message: 'Vui lòng cung cấp classSessionId' };
    }

    const roomName = `session_${classSessionId}`;
    client.join(roomName);
    this.logger.log(`Socket ${client.id} joined room ${roomName} for QR stream`);

    // Gửi ngay dữ liệu thống kê + danh sách SV đã điểm danh trước đó cho client vừa mở modal
    await this.sendInitialStats(client, classSessionId);

    // Hủy interval cũ nếu có để tránh chạy song song 2 timer
    if (this.activeTimers.has(classSessionId)) {
      clearInterval(this.activeTimers.get(classSessionId)!);
      this.activeTimers.delete(classSessionId);
    }

    // Hàm phát mã QR mới
    const emitNewQr = () => {
      const token = this.qrSecurityService.generateToken(classSessionId, intervalSec);
      this.server.to(roomName).emit('qr_tick', {
        classSessionId,
        token,
        expiresIn: intervalSec,
        timestamp: Date.now(),
      });
    };

    // Phát ngay lập tức mã đầu tiên khi giảng viên vừa bấm mở
    emitNewQr();

    // Thiết lập interval định kỳ mỗi intervalSec giây
    const timer = setInterval(emitNewQr, intervalSec * 1000);
    this.activeTimers.set(classSessionId, timer);

    return {
      success: true,
      message: `Đang phát chuỗi mã QR động (Làm mới mỗi ${intervalSec}s)`,
      room: roomName,
    };
  }

  /**
   * Giảng viên dừng trình chiếu mã QR
   * Client emit: 'stop_qr_stream' kèm { classSessionId }
   */
  @SubscribeMessage('stop_qr_stream')
  handleStopQrStream(
    @MessageBody() data: { classSessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { classSessionId } = data;
    if (classSessionId && this.activeTimers.has(classSessionId)) {
      clearInterval(this.activeTimers.get(classSessionId)!);
      this.activeTimers.delete(classSessionId);
      this.logger.log(`Stopped QR stream for session: ${classSessionId}`);
    }

    if (classSessionId) {
      const roomName = `session_${classSessionId}`;
      client.leave(roomName);
    }

    return { success: true, message: 'Đã dừng phát chuỗi mã QR' };
  }

  /**
   * Phát thông báo Sinh viên điểm danh thành công theo thời gian thực (Live Stream Feed)
   * lên màn hình máy chiếu của giảng viên
   */
  broadcastLiveCheckIn(classSessionId: string, studentData: any) {
    if (!this.server) return;
    const roomName = `session_${classSessionId}`;
    this.server.to(roomName).emit('attendance_realtime_update', studentData);
    this.logger.log(`Broadcasted live check-in for student ${studentData?.studentCode || studentData?.fullName} in room ${roomName}`);
  }
}
