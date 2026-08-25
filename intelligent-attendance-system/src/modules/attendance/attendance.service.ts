import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { AttendanceConfig, AttendanceConfigDocument } from './schemas/attendance-config.schema';
import { ClassSession, ClassSessionDocument } from '../academic/course-section/schemas/class-session.schema';
import { Enrollment, EnrollmentDocument } from '../academic/student/schemas/enrollment.schema';
import { PeriodConfig, PeriodConfigDocument } from '../config/schemas/period-config.schema';
import { CourseSection, CourseSectionDocument } from '../academic/course-section/schemas/course-section.schema';
import { CheckInDto } from './dto/check-in.dto';
import { UpdateAttendanceConfigDto } from './dto/update-attendance-config.dto';
import { calculateHaversineDistance } from '../../common/utils/distance.util';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(AttendanceConfig.name)
    private attendanceConfigModel: Model<AttendanceConfigDocument>,
    @InjectModel(ClassSession.name)
    private classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(PeriodConfig.name)
    private periodConfigModel: Model<PeriodConfigDocument>,
    @InjectModel(CourseSection.name)
    private courseSectionModel: Model<CourseSectionDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  async getConfig(): Promise<AttendanceConfigDocument> {
    let config = await this.attendanceConfigModel.findOne({ isActive: true });
    if (!config) {
      config = await this.attendanceConfigModel.create({
        gracePeriodMinutes: 10,
        lateThresholdMinutes: 30,
        allowSelfCheckIn: true,
        allowedPublicIps: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
        latitude: 21.028511,
        longitude: 105.804817,
        allowedRadiusMeters: 20,
        requireWifiCheck: true,
        requireLocationCheck: true,
        isActive: true,
      });
    }
    return config;
  }

  async updateConfig(dto: UpdateAttendanceConfigDto): Promise<AttendanceConfigDocument> {
    let config = await this.attendanceConfigModel.findOne({ isActive: true });
    if (!config) {
      config = new this.attendanceConfigModel(dto);
    } else {
      Object.assign(config, dto);
    }
    return config.save();
  }

  /**
   * Tự động lấy danh sách tiết học/buổi học HÔM NAY của sinh viên đang đăng nhập
   */
  async getTodaySessions(studentId: string) {
    const enrollments = await this.enrollmentModel.find({
      studentId: new Types.ObjectId(studentId),
      status: 'enrolled',
    });

    if (!enrollments.length) {
      return [];
    }

    const courseSectionIds = enrollments.map((e) => e.courseSectionId);

    // Lấy khoảng thời gian của ngày hôm nay
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Tìm tất cả các ClassSession diễn ra trong hôm nay
    let sessions = await this.classSessionModel
      .find({
        courseSectionId: { $in: courseSectionIds },
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' },
      })
      .populate({
        path: 'courseSectionId',
        populate: { path: 'subjectId' },
      })
      .populate('lecturerId', 'fullName email userCode')
      .exec();

    // Nếu không có buổi học hôm nay (ví dụ dữ liệu seed chưa có hôm nay), fallback lấy các buổi học khả dụng nhất
    if (!sessions.length) {
      sessions = await this.classSessionModel
        .find({
          courseSectionId: { $in: courseSectionIds },
          status: { $ne: 'cancelled' },
        })
        .sort({ date: -1 })
        .limit(5)
        .populate({
          path: 'courseSectionId',
          populate: { path: 'subjectId' },
        })
        .populate('lecturerId', 'fullName email userCode')
        .exec();
    }

    const periodConfigs = await this.periodConfigModel.find({ isActive: true });
    const periodMap = new Map(periodConfigs.map((p) => [p.periodNumber, p]));

    const results = await Promise.all(
      sessions.map(async (session) => {
        const attendance = await this.attendanceModel.findOne({
          classSessionId: session._id,
          studentId: new Types.ObjectId(studentId),
        });

        const startPeriodCfg = periodMap.get(session.startPeriod);
        const endPeriodCfg = periodMap.get(session.startPeriod + session.numPeriods - 1);

        return {
          _id: session._id,
          date: session.date,
          room: session.room,
          startPeriod: session.startPeriod,
          numPeriods: session.numPeriods,
          startTime: startPeriodCfg?.startTime || '07:00',
          endTime: endPeriodCfg?.endTime || '09:30',
          courseSection: session.courseSectionId,
          lecturer: session.lecturerId,
          attendance: attendance
            ? {
                _id: attendance._id,
                checkInTime: attendance.checkInTime,
                checkOutTime: attendance.checkOutTime,
                status: attendance.status,
                isCheckedIn: !!attendance.checkInTime,
                isCheckedOut: !!attendance.checkOutTime,
                note: attendance.note,
              }
            : {
                checkInTime: null,
                checkOutTime: null,
                status: 'none',
                isCheckedIn: false,
                isCheckedOut: false,
                note: null,
              },
        };
      }),
    );

    return results;
  }

  private getEffectiveSessionConfig(session: any, globalConfig: any) {
    const requireWifiCheck = session.requireWifiCheck != null ? session.requireWifiCheck : globalConfig.requireWifiCheck;
    const allowedPublicIps = (session.allowedPublicIps && session.allowedPublicIps.length > 0)
      ? session.allowedPublicIps
      : (globalConfig.allowedPublicIps || []);

    const requireLocationCheck = session.requireLocationCheck != null ? session.requireLocationCheck : globalConfig.requireLocationCheck;
    const latitude = session.latitude != null ? session.latitude : globalConfig.latitude;
    const longitude = session.longitude != null ? session.longitude : globalConfig.longitude;
    const allowedRadiusMeters = session.allowedRadiusMeters != null ? session.allowedRadiusMeters : globalConfig.allowedRadiusMeters;

    return {
      requireWifiCheck,
      allowedPublicIps,
      requireLocationCheck,
      latitude,
      longitude,
      allowedRadiusMeters,
    };
  }

  /**
   * Sinh viên thực hiện Điểm danh vào (Check-in)
   */
  async checkIn(
    studentId: string,
    dto: CheckInDto,
    clientIp: string,
    deviceInfo?: string,
  ) {
    const config = await this.getConfig();

    if (!config.allowSelfCheckIn) {
      throw new BadRequestException('Hệ thống hiện đang tắt chức năng tự điểm danh.');
    }

    // ── 1. Kiểm tra Sinh viên có ghi danh học phần này ────────────
    const enrollment = await this.enrollmentModel.findOne({
      studentId: new Types.ObjectId(studentId),
      courseSectionId: new Types.ObjectId(dto.courseSectionId),
      status: 'enrolled',
    });

    if (!enrollment) {
      throw new BadRequestException('Bạn chưa đăng ký lớp học phần này hoặc đăng ký đã bị hủy.');
    }

    // ── 2. Kiểm tra Buổi học tồn tại ─────────────────────
    const session = await this.classSessionModel.findById(dto.classSessionId);
    if (!session || session.status === 'cancelled') {
      throw new BadRequestException('Buổi học không tồn tại hoặc đã bị hủy lịch.');
    }

    // Lấy cấu hình hiệu lực (Ưu tiên cấu hình riêng của Buổi học -> Fallback cấu hình chung Admin)
    const effectiveConfig = this.getEffectiveSessionConfig(session, config);

    const now = new Date();

    // ── 3. Kiểm tra Giờ học theo Tiết ────────────────────────
    const startPeriodNumber = session.startPeriod;
    const endPeriodNumber = session.startPeriod + session.numPeriods - 1;

    const [startPeriodCfg, endPeriodCfg] = await Promise.all([
      this.periodConfigModel.findOne({ periodNumber: startPeriodNumber, isActive: true }),
      this.periodConfigModel.findOne({ periodNumber: endPeriodNumber, isActive: true }),
    ]);

    let attendanceStatus = 'present';

    if (startPeriodCfg && endPeriodCfg) {
      const [startHour, startMin] = startPeriodCfg.startTime.split(':').map(Number);
      const [endHour, endMin] = endPeriodCfg.endTime.split(':').map(Number);

      const sessionStartTime = new Date(now);
      sessionStartTime.setHours(startHour, startMin, 0, 0);

      const sessionEndTime = new Date(now);
      sessionEndTime.setHours(endHour, endMin, 0, 0);

      const graceMins = config.gracePeriodMinutes ?? 5;
      const graceTime = new Date(sessionStartTime.getTime() + graceMins * 60 * 1000);
      if (now > graceTime) {
        attendanceStatus = 'late';
      } else {
        attendanceStatus = 'present';
      }
    }

    // ── 4. Kiểm tra WiFi Public IP theo buổi học ──────────────────────────────
    if (effectiveConfig.requireWifiCheck) {
      const allowedIps = effectiveConfig.allowedPublicIps || [];
      const normalizedClientIp = clientIp.replace(/^::ffff:/, '');
      const isAllowedIp = allowedIps.some((ip) => {
        const normalizedAllowed = ip.replace(/^::ffff:/, '');
        return normalizedAllowed === normalizedClientIp || ip === clientIp;
      });

      if (!isAllowedIp) {
        throw new BadRequestException(
          `Bạn chưa kết nối đúng mạng WiFi hợp lệ để điểm danh. (Địa chỉ IP của bạn: ${clientIp})`,
        );
      }
    }

    // ── 5. Kiểm tra vị trí GPS & khoảng cách theo buổi học ──────────────────
    let calculatedDistance: number | null = null;
    if (effectiveConfig.requireLocationCheck) {
      if (dto.userLat === undefined || dto.userLng === undefined || dto.userLat === null || dto.userLng === null) {
        throw new BadRequestException('Bạn cần cung cấp tọa độ GPS để điểm danh.');
      }

      calculatedDistance = calculateHaversineDistance(
        effectiveConfig.latitude,
        effectiveConfig.longitude,
        dto.userLat,
        dto.userLng,
      );

      const accuracyBuffer = Math.min(dto.accuracy || 0, 15);
      const effectiveRadius = effectiveConfig.allowedRadiusMeters + accuracyBuffer;

      if (calculatedDistance > effectiveRadius) {
        throw new BadRequestException(
          `Vị trí của bạn nằm ngoài bán kính cho phép của buổi học (${Math.round(calculatedDistance)}m > ${effectiveConfig.allowedRadiusMeters}m).`,
        );
      }
    }

    // ── 6. Ghi nhận Check-in ────────────────────────────────────────────────
    const existingAttendance = await this.attendanceModel.findOne({
      classSessionId: new Types.ObjectId(dto.classSessionId),
      studentId: new Types.ObjectId(studentId),
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      throw new BadRequestException('Bạn đã điểm danh vào (Check-in) cho buổi học này rồi.');
    }

    const attendanceRecord = await this.attendanceModel.findOneAndUpdate(
      {
        classSessionId: new Types.ObjectId(dto.classSessionId),
        studentId: new Types.ObjectId(studentId),
      },
      {
        courseSectionId: new Types.ObjectId(dto.courseSectionId),
        checkInTime: now,
        status: attendanceStatus,
        method: 'self',
        capturedImage: dto.capturedImage || null,
        deviceInfo: deviceInfo || `IP: ${clientIp} | GPS Dist: ${calculatedDistance ? Math.round(calculatedDistance) + 'm' : 'N/A'}`,
        note: dto.note || null,
      },
      { upsert: true, new: true },
    );

    // 🔔 Gửi thông báo tới Sinh viên qua NotificationService (kênh Firebase + Socket)
    try {
      const templateCode = attendanceStatus === 'late' ? 'attendance.late' : 'attendance.checkin';
      await this.notificationService.send({
        recipientIds: [studentId],
        templateCode,
        variables: {
          studentName: 'Bạn',
          periodName: `Tiết ${session.startPeriod}`,
          time: now.toLocaleTimeString('vi-VN'),
          minutesLate: '15',
        },
        eventType: templateCode,
      });
    } catch (err: any) {
      console.warn(`Failed to send attendance notification: ${err?.message}`);
    }

    return {
      message: attendanceStatus === 'late' ? 'Điểm danh vào thành công (Đi muộn).' : 'Điểm danh vào thành công (Đúng giờ)!',
      attendance: attendanceRecord,
      distanceMeters: calculatedDistance ? Math.round(calculatedDistance) : null,
      clientIp,
      status: attendanceStatus,
    };
  }

  /**
   * Sinh viên thực hiện Điểm danh ra (Check-out)
   */
  async checkOut(
    studentId: string,
    dto: CheckInDto,
    clientIp: string,
    deviceInfo?: string,
  ) {
    const config = await this.getConfig();

    const existingAttendance = await this.attendanceModel.findOne({
      classSessionId: new Types.ObjectId(dto.classSessionId),
      studentId: new Types.ObjectId(studentId),
    });

    if (!existingAttendance || !existingAttendance.checkInTime) {
      throw new BadRequestException('Bạn phải thực hiện điểm danh vào (Check-in) trước khi Check-out.');
    }

    if (existingAttendance.checkOutTime) {
      throw new BadRequestException('Bạn đã thực hiện điểm danh ra (Check-out) cho buổi học này rồi.');
    }

    const session = await this.classSessionModel.findById(dto.classSessionId);
    const effectiveConfig = session
      ? this.getEffectiveSessionConfig(session, config)
      : {
          requireWifiCheck: config.requireWifiCheck,
          allowedPublicIps: config.allowedPublicIps,
          requireLocationCheck: config.requireLocationCheck,
          latitude: config.latitude,
          longitude: config.longitude,
          allowedRadiusMeters: config.allowedRadiusMeters,
        };

    const now = new Date();

    // ── Kiểm tra giờ kết thúc buổi học (Check-out phải đúng giờ) ────────────
    let isEarlyLeave = false;
    if (session) {
      const endPeriodNumber = session.startPeriod + session.numPeriods - 1;
      const endPeriodCfg = await this.periodConfigModel.findOne({ periodNumber: endPeriodNumber, isActive: true });
      if (endPeriodCfg) {
        const [endHour, endMin] = endPeriodCfg.endTime.split(':').map(Number);
        const sessionEndTime = new Date(now);
        sessionEndTime.setHours(endHour, endMin, 0, 0);

        // Trước giờ kết thúc buổi học 2 phút được coi là về sớm
        const allowedCheckOutTime = new Date(sessionEndTime.getTime() - 2 * 60 * 1000);
        if (now < allowedCheckOutTime) {
          isEarlyLeave = true;
        }
      }
    }

    // Kiểm tra WiFi nếu yêu cầu
    if (effectiveConfig.requireWifiCheck) {
      const allowedIps = effectiveConfig.allowedPublicIps || [];
      const normalizedClientIp = clientIp.replace(/^::ffff:/, '');
      const isAllowedIp = allowedIps.some((ip) => {
        const normalizedAllowed = ip.replace(/^::ffff:/, '');
        return normalizedAllowed === normalizedClientIp || ip === clientIp;
      });

      if (!isAllowedIp) {
        throw new BadRequestException(
          `Bạn chưa kết nối đúng mạng WiFi hợp lệ để Check-out. (IP: ${clientIp})`,
        );
      }
    }

    // Kiểm tra GPS nếu yêu cầu
    let calculatedDistance: number | null = null;
    if (effectiveConfig.requireLocationCheck) {
      if (dto.userLat === undefined || dto.userLng === undefined || dto.userLat === null || dto.userLng === null) {
        throw new BadRequestException('Bạn cần cung cấp tọa độ GPS để Check-out.');
      }

      calculatedDistance = calculateHaversineDistance(
        effectiveConfig.latitude,
        effectiveConfig.longitude,
        dto.userLat,
        dto.userLng,
      );

      const accuracyBuffer = Math.min(dto.accuracy || 0, 15);
      const effectiveRadius = effectiveConfig.allowedRadiusMeters + accuracyBuffer;

      if (calculatedDistance > effectiveRadius) {
        throw new BadRequestException(
          `Vị trí của bạn nằm ngoài bán kính cho phép khi Check-out (${Math.round(calculatedDistance)}m > ${effectiveConfig.allowedRadiusMeters}m).`,
        );
      }
    }

    existingAttendance.checkOutTime = now;
    if (isEarlyLeave) {
      existingAttendance.status = 'early_leave';
    }
    if (dto.note) {
      existingAttendance.note = existingAttendance.note ? `${existingAttendance.note} | Out: ${dto.note}` : dto.note;
    }
    await existingAttendance.save();

    // 🔔 Gửi thông báo Check-out qua NotificationService (kênh Firebase + Socket)
    try {
      const templateCode = isEarlyLeave ? 'attendance.early_leave' : 'attendance.checkout';
      await this.notificationService.send({
        recipientIds: [studentId],
        templateCode,
        variables: {
          time: now.toLocaleTimeString('vi-VN'),
        },
        eventType: templateCode,
      });
    } catch (err: any) {
      console.warn(`Failed to send checkout notification: ${err?.message}`);
    }

    return {
      message: isEarlyLeave
        ? 'Điểm danh ra thành công (Cảnh báo: Bạn đã Check-out sớm trước khi tiết học kết thúc).'
        : 'Điểm danh ra (Check-out) thành công đúng giờ!',
      attendance: existingAttendance,
      distanceMeters: calculatedDistance ? Math.round(calculatedDistance) : null,
      clientIp,
    };
  }


  async getStudentHistory(studentId: string) {
    return this.attendanceModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('classSessionId')
      .populate('courseSectionId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Báo cáo danh sách điểm danh chi tiết cho Giảng viên & Admin
   * Hỗ trợ lọc theo Lớp học phần (courseSectionId), Buổi học (classSessionId), Ngày học (date), Trạng thái (status) & Từ khóa tìm kiếm
   */
  async getCourseSectionReport(query: {
    courseSectionId?: string;
    classSessionId?: string;
    date?: string;
    status?: string;
    search?: string;
  }) {
    const filter: any = {};

    if (query.courseSectionId && Types.ObjectId.isValid(query.courseSectionId)) {
      filter.courseSectionId = new Types.ObjectId(query.courseSectionId);
    }

    if (query.classSessionId && Types.ObjectId.isValid(query.classSessionId)) {
      filter.classSessionId = new Types.ObjectId(query.classSessionId);
    }

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    // Lọc theo Ngày học nếu có
    if (query.date) {
      const d = new Date(query.date);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const sessions = await this.classSessionModel.find({
        date: { $gte: startOfDay, $lte: endOfDay },
      }).select('_id').lean();

      const sessionIds = sessions.map((s) => s._id);
      filter.classSessionId = { $in: sessionIds };
    }

    let records = await this.attendanceModel
      .find(filter)
      .populate('studentId', 'fullName userCode email phone avatarUrl')
      .populate({
        path: 'classSessionId',
        select: 'date room startPeriod numPeriods status',
      })
      .populate({
        path: 'courseSectionId',
        select: 'sectionCode room',
        populate: { path: 'subjectId', select: 'code name' },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Lọc tìm kiếm theo Tên, Mã SV hoặc Email sinh viên
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      records = records.filter((r: any) => {
        const student = r.studentId;
        if (!student) return false;
        return (
          searchRegex.test(student.fullName || '') ||
          searchRegex.test(student.userCode || '') ||
          searchRegex.test(student.email || '')
        );
      });
    }

    // Thống kê tổng hợp số lượng
    const totalRecords = records.length;
    const presentCount = records.filter((r: any) => r.status === 'present').length;
    const lateCount = records.filter((r: any) => r.status === 'late').length;
    const earlyLeaveCount = records.filter((r: any) => r.status === 'early_leave').length;
    const absentCount = records.filter((r: any) => r.status === 'absent').length;
    const excusedCount = records.filter((r: any) => r.status === 'excused').length;

    return {
      summary: {
        totalRecords,
        presentCount,
        lateCount,
        earlyLeaveCount,
        absentCount,
        excusedCount,
      },
      records,
    };
  }
}

