import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassSession, ClassSessionDocument } from '../modules/academic/course-section/schemas/class-session.schema';
import { CourseSection, CourseSectionDocument } from '../modules/academic/course-section/schemas/course-section.schema';
import { Enrollment, EnrollmentDocument } from '../modules/academic/student/schemas/enrollment.schema';
import { PeriodConfig, PeriodConfigDocument } from '../modules/config/schemas/period-config.schema';
import { AttendanceConfig, AttendanceConfigDocument } from '../modules/attendance/schemas/attendance-config.schema';
import { Attendance, AttendanceDocument } from '../modules/attendance/schemas/attendance.schema';
import { LeaveRequest, LeaveRequestDocument } from '../modules/attendance/schemas/leave-request.schema';
import { LeaveRequestHistory, LeaveRequestHistoryDocument } from '../modules/attendance/schemas/leave-request-history.schema';

@Injectable()
export class DemoSeedService {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(
    @InjectModel(ClassSession.name) private classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(PeriodConfig.name) private periodConfigModel: Model<PeriodConfigDocument>,
    @InjectModel(AttendanceConfig.name) private attendanceConfigModel: Model<AttendanceConfigDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveRequestHistory.name) private leaveRequestHistoryModel: Model<LeaveRequestHistoryDocument>,
  ) {}

  async runDemoSeed() {
    this.logger.log('🚀 Bắt đầu tạo dữ liệu demo điểm danh...');
    await this.seedClassSessionsAndAttendances();
    this.logger.log('✅ Hoàn tất tạo dữ liệu demo!');
  }

  /**
   * LUỒNG THỰC TẾ:
   * 1. Load toàn bộ CourseSection có Enrollment
   * 2. Mỗi CourseSection → sinh 12 ClassSession (1 buổi/tuần, trải ngược 12 tuần)
   * 3. Với buổi học có sinh viên "excused": sinh LeaveRequest (approved) + LeaveRequestHistory trước
   * 4. Với mỗi ClassSession + mỗi Enrollment → sinh Attendance, gắn leaveRequestId nếu excused
   *
   * Tỉ lệ mô phỏng: 70% đúng giờ | 15% muộn | 10% vắng | 5% vắng có phép (excused)
   * Sinh 30 buổi/lớp → ~9 lớp × 2.5 SV × 30 buổi ≈ 675+ bản ghi attendance
   */
  private async seedClassSessionsAndAttendances() {
    // ── 1. Load cấu hình hệ thống ──────────────────────────────────────────
    const [attendanceConfig, periodConfigs] = await Promise.all([
      this.attendanceConfigModel.findOne({ isActive: true }),
      this.periodConfigModel.find({ isActive: true }).sort({ periodNumber: 1 }),
    ]);

    const graceMins = attendanceConfig?.gracePeriodMinutes ?? 10;
    const lateMins  = attendanceConfig?.lateThresholdMinutes ?? 30;

    const periodMap = new Map<number, { startTime: string }>();
    for (const p of periodConfigs) {
      periodMap.set(p.periodNumber, { startTime: p.startTime });
    }

    // ── 2. Load CourseSection ────────────────────────────────────────────────
    const courseSections = await this.courseSectionModel.find({
      status: { $in: ['open', 'closed'] },
    });

    if (courseSections.length === 0) {
      this.logger.warn('⚠️  Không tìm thấy CourseSection nào. Hãy chạy npm run seed trước!');
      return;
    }

    let totalSessions   = 0;
    let totalAttendances = 0;
    let totalLeaveRequests = 0;

    for (const section of courseSections) {
      // ── 3. Load danh sách sinh viên enrolled ─────────────────────────────
      const enrollments = await this.enrollmentModel.find({
        courseSectionId: section._id,
        status: 'enrolled',
      });

      if (enrollments.length === 0) continue;

      const defaultStartPeriod = section.scheduleStartPeriod || 1;
      const defaultNumPeriods  = section.scheduleNumPeriods  || 3;
      const defaultRoom        = section.room || 'A101';

      // ── 4. Sinh 30 ClassSession (1 buổi/tuần × 30 tuần ≈ 1 học kỳ) ──────
      const sessions = await this.generateClassSessions(
        section._id as Types.ObjectId,
        defaultStartPeriod,
        defaultNumPeriods,
        defaultRoom,
        30,
      );
      totalSessions += sessions.length;

      for (const session of sessions) {
        const periodInfo   = periodMap.get(session.startPeriod);
        let sessionStartMs: number | null = null;

        if (periodInfo) {
          const [h, m] = periodInfo.startTime.split(':').map(Number);
          const d = new Date(session.date);
          d.setHours(h, m, 0, 0);
          sessionStartMs = d.getTime();
        }

        // ── 5. Sinh Attendance cho từng sinh viên ────────────────────────────
        const attendanceBulk: any[] = [];

        for (const enrollment of enrollments) {
          // Tránh duplicate khi chạy lại seed
          const already = await this.attendanceModel.exists({
            classSessionId: session._id,
            studentId: enrollment.studentId,
          });
          if (already) continue;

          const behavior = this.randomBehavior();
          let status: string      = 'absent';
          let checkInTime: Date | null = null;
          let method: string      = 'self';
          let note: string | null = null;
          let leaveRequestId: Types.ObjectId | null = null;

          switch (behavior) {
            case 'present': {
              if (sessionStartMs) {
                const offset = randomInt(-10 * 60_000, graceMins * 60_000);
                checkInTime = new Date(sessionStartMs + offset);
              }
              status = 'present';
              method = 'self';
              break;
            }

            case 'late': {
              if (sessionStartMs) {
                const offset = randomInt((graceMins + 1) * 60_000, lateMins * 60_000);
                checkInTime = new Date(sessionStartMs + offset);
              }
              status = 'late';
              method = 'self';
              break;
            }

            case 'excused': {
              // ── 6. Sinh LeaveRequest (approved) rồi gắn vào Attendance ────
              const lr = await this.createApprovedLeaveRequest(
                enrollment.studentId as Types.ObjectId,
                section._id as Types.ObjectId,
                session._id as Types.ObjectId,
                session.date,
              );
              leaveRequestId = lr._id as Types.ObjectId;
              status = 'excused';
              method = 'manual';
              note   = lr.reason;
              totalLeaveRequests++;
              break;
            }

            default: {
              // absent – không làm gì thêm
              status = 'absent';
              method = 'self';
              break;
            }
          }

          attendanceBulk.push({
            classSessionId:  session._id,
            courseSectionId: section._id,
            studentId:       enrollment.studentId,
            leaveRequestId,
            checkInTime,
            status,
            method,
            note,
            capturedImage: null,
            deviceInfo:
              behavior === 'present' || behavior === 'late'
                ? pick(['192.168.1.101', '192.168.1.102', '192.168.1.103', '10.0.0.55'])
                : null,
            updatedBy: null,
          });
        }

        if (attendanceBulk.length > 0) {
          await this.attendanceModel.insertMany(attendanceBulk, { ordered: false });
          totalAttendances += attendanceBulk.length;
        }
      }

      this.logger.log(
        `📋 [${section.sectionCode}]: ${sessions.length} buổi | ${enrollments.length} sinh viên`,
      );
    }

    this.logger.log(`\n📊 Tổng kết dữ liệu demo đã tạo:`);
    this.logger.log(`   - ClassSession   : ${totalSessions}`);
    this.logger.log(`   - Attendance     : ${totalAttendances}`);
    this.logger.log(`   - LeaveRequest   : ${totalLeaveRequests}`);
  }

  // ============================================================
  //  Tạo LeaveRequest đã được duyệt (approved) kèm lịch sử
  // ============================================================
  private async createApprovedLeaveRequest(
    studentId: Types.ObjectId,
    courseSectionId: Types.ObjectId,
    classSessionId: Types.ObjectId,
    sessionDate: Date,
  ): Promise<LeaveRequestDocument> {
    const reason   = pick(LEAVE_REASONS);
    const leaveType = pick<'sick' | 'personal' | 'family' | 'other'>(['sick', 'personal', 'family', 'other']);

    // Thời gian nộp đơn: 1-3 ngày trước buổi học
    const submittedAt = new Date(sessionDate.getTime() - randomInt(1, 3) * 86_400_000);

    // Thời gian duyệt: 2-12 giờ sau khi nộp
    const reviewedAt = new Date(submittedAt.getTime() + randomInt(2, 12) * 3_600_000);

    const lr = await this.leaveRequestModel.create({
      studentId,
      courseSectionId,
      classSessionId,
      leaveType,
      reason,
      attachmentUrl:      leaveType === 'sick' ? `https://storage.example.com/medical/${studentId}.jpg` : null,
      attachmentPublicId: leaveType === 'sick' ? `medical/${studentId}` : null,
      fromDate:   sessionDate,
      toDate:     sessionDate,
      status:     'approved',
      reviewedBy: null,   // Giảng viên duyệt (null vì seed không có ID giảng viên cụ thể)
      reviewedAt,
      rejectionReason: null,
    });

    // Ghi lịch sử: tạo đơn → duyệt
    await this.leaveRequestHistoryModel.insertMany([
      {
        leaveRequestId: lr._id,
        action:      'created',
        performedBy: studentId,
        note:        null,
        createdAt:   submittedAt,
      },
      {
        leaveRequestId: lr._id,
        action:      'approved',
        performedBy: studentId,   // placeholder – thực tế là ID giảng viên
        note:        'Đã xem xét và đồng ý',
        createdAt:   reviewedAt,
      },
    ]);

    return lr;
  }

  // ============================================================
  //  Sinh 12 ClassSession cho 1 CourseSection
  // ============================================================
  private async generateClassSessions(
    courseSectionId: Types.ObjectId,
    startPeriod: number,
    numPeriods: number,
    room: string,
    count: number,
  ): Promise<ClassSessionDocument[]> {
    const sessions: ClassSessionDocument[] = [];
    const existing = await this.classSessionModel.findOne({ courseSectionId });
    const lecturerId = existing?.lecturerId ?? null;

    const now        = new Date();
    const startMs    = now.getTime() - count * 7 * 86_400_000;

    for (let i = 0; i < count; i++) {
      const sessionDate = new Date(startMs + i * 7 * 86_400_000);
      sessionDate.setHours(0, 0, 0, 0);

      let doc = await this.classSessionModel.findOne({ courseSectionId, date: sessionDate });

      if (!doc) {
        doc = await this.classSessionModel.create({
          courseSectionId,
          lecturerId,
          date: sessionDate,
          startPeriod,
          numPeriods,
          room,
          status: sessionDate < now ? 'completed' : 'scheduled',
        });
      }

      sessions.push(doc);
    }

    return sessions;
  }

  // ============================================================
  //  Phân bổ xác suất hành vi điểm danh
  // ============================================================
  private randomBehavior(): 'present' | 'late' | 'absent' | 'excused' {
    const r = Math.random() * 100;
    if (r < 70) return 'present';
    if (r < 85) return 'late';
    if (r < 95) return 'absent';
    return 'excused';
  }
}

// ============================================================
//  Dữ liệu mẫu & helpers
// ============================================================

const LEAVE_REASONS = [
  'Em bị ốm, đang điều trị tại nhà',
  'Em có việc gia đình đột xuất không thể đến lớp',
  'Em cần về quê giải quyết việc cấp bách',
  'Em đi khám bệnh theo lịch hẹn của bác sĩ',
  'Em tham gia hoạt động ngoại khóa được nhà trường cử đi',
  'Em bị tai nạn nhẹ cần nghỉ ngơi',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
