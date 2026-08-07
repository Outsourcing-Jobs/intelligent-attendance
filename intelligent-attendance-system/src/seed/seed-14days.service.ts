import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassSession, ClassSessionDocument } from '../modules/academic/course-section/schemas/class-session.schema';
import { CourseSection, CourseSectionDocument } from '../modules/academic/course-section/schemas/course-section.schema';
import { Enrollment, EnrollmentDocument } from '../modules/academic/student/schemas/enrollment.schema';
import { PeriodConfig, PeriodConfigDocument } from '../modules/config/schemas/period-config.schema';
import { AttendanceConfig, AttendanceConfigDocument } from '../modules/attendance/schemas/attendance-config.schema';
import { Attendance, AttendanceDocument } from '../modules/attendance/schemas/attendance.schema';
import { User, UserDocument } from '../modules/user/schemas/user.schema';

@Injectable()
export class Seed14DaysService {
  private readonly logger = new Logger(Seed14DaysService.name);

  constructor(
    @InjectModel(ClassSession.name) private classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(PeriodConfig.name) private periodConfigModel: Model<PeriodConfigDocument>,
    @InjectModel(AttendanceConfig.name) private attendanceConfigModel: Model<AttendanceConfigDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async runSeed14Days() {
    this.logger.log('🚀 Đang khởi tạo dữ liệu điểm danh 1 THÁNG LIÊN TIẾP (đến 05/08/2026)...');
    const startOverall = Date.now();

    // 1. Load cấu hình tiết học
    const periodConfigs = await this.periodConfigModel.find({ isActive: true }).sort({ periodNumber: 1 }).lean();
    const periodMap = new Map<number, { startTime: string; endTime: string }>();
    for (const p of periodConfigs) {
      periodMap.set(p.periodNumber, { startTime: p.startTime, endTime: p.endTime });
    }

    // 2. Load danh sách tất cả lớp học phần
    const courseSections = await this.courseSectionModel.find({ status: { $in: ['open', 'closed'] } }).lean();
    if (courseSections.length === 0) {
      this.logger.warn('⚠️ Không tìm thấy lớp học phần nào. Hãy chạy npm run seed trước!');
      return;
    }

    // 3. Load tất cả sinh viên
    const students = await this.userModel.find({ roleCode: { $ne: 'admin' } }).lean();
    this.logger.log(`👥 Đã tìm thấy ${students.length} sinh viên và ${courseSections.length} lớp học phần.`);

    // Bulk write ghi danh sinh viên
    const existingEnrollments = await this.enrollmentModel.find().select('studentId courseSectionId').lean();
    const enrollmentSet = new Set(existingEnrollments.map((e) => `${e.studentId}-${e.courseSectionId}`));
    const bulkEnrollments: any[] = [];

    for (const section of courseSections) {
      for (const student of students) {
        const key = `${student._id}-${section._id}`;
        if (!enrollmentSet.has(key)) {
          bulkEnrollments.push({
            studentId: new Types.ObjectId(String(student._id)),
            courseSectionId: new Types.ObjectId(String(section._id)),
            enrollmentDate: new Date('2026-07-01'),
            status: 'enrolled',
          });
          enrollmentSet.add(key);
        }
      }
    }

    if (bulkEnrollments.length > 0) {
      await this.enrollmentModel.insertMany(bulkEnrollments);
      this.logger.log(`⚡ Đã tạo mới ${bulkEnrollments.length} ghi danh sinh viên.`);
    }

    // 4. Danh sách 30 ngày liên tiếp (1 THÁNG) đến ngày 05/08/2026
    const targetDates: Date[] = [];
    const endDate = new Date(2026, 7, 5); // 05/08/2026

    for (let i = 29; i >= 0; i--) {
      const d = new Date(endDate.getTime() - i * 86400000);
      d.setHours(0, 0, 0, 0);
      targetDates.push(d);
    }

    // Batch insert các ClassSession còn thiếu trong 30 ngày
    const existingSessions = await this.classSessionModel.find({
      date: { $gte: targetDates[0], $lte: endDate },
    }).lean();

    const sessionMap = new Map<string, any>();
    for (const s of existingSessions) {
      const dateKey = new Date(s.date).toISOString().split('T')[0];
      sessionMap.set(`${s.courseSectionId}-${dateKey}`, s);
    }

    const newSessionsToInsert: any[] = [];
    for (const currentDate of targetDates) {
      const dateKey = currentDate.toISOString().split('T')[0];
      for (const section of courseSections) {
        const key = `${section._id}-${dateKey}`;
        if (!sessionMap.has(key)) {
          newSessionsToInsert.push({
            _id: new Types.ObjectId(),
            courseSectionId: new Types.ObjectId(String(section._id)),
            date: currentDate,
            startPeriod: section.scheduleStartPeriod || 1,
            numPeriods: section.scheduleNumPeriods || 3,
            room: section.room || 'A101',
            status: 'completed',
          });
        }
      }
    }

    if (newSessionsToInsert.length > 0) {
      const inserted = await this.classSessionModel.insertMany(newSessionsToInsert);
      for (const s of inserted) {
        const dateKey = new Date(s.date).toISOString().split('T')[0];
        sessionMap.set(`${s.courseSectionId}-${dateKey}`, s);
      }
      this.logger.log(`⚡ Đã siêu tốc tạo ${newSessionsToInsert.length} buổi học cho 1 tháng.`);
    }

    // Load toàn bộ Attendance vào Set memory
    const existingAttendances = await this.attendanceModel.find().select('classSessionId studentId').lean();
    const attendanceSet = new Set(existingAttendances.map((a) => `${a.classSessionId}-${a.studentId}`));

    const attendancesBulk: any[] = [];
    const ipList = ['113.161.12.34', '113.161.12.35', '14.225.20.10', '127.0.0.1'];

    for (const currentDate of targetDates) {
      const dateKey = currentDate.toISOString().split('T')[0];

      for (const section of courseSections) {
        const key = `${section._id}-${dateKey}`;
        const session = sessionMap.get(key);
        if (!session) continue;

        const startPeriod = section.scheduleStartPeriod || 1;
        const numPeriods = section.scheduleNumPeriods || 3;
        const startPeriodCfg = periodMap.get(startPeriod);
        const endPeriodCfg = periodMap.get(startPeriod + numPeriods - 1);

        let sessionStartMs = currentDate.getTime() + 7 * 3600 * 1000;
        let sessionEndMs = currentDate.getTime() + 9.5 * 3600 * 1000;

        if (startPeriodCfg && endPeriodCfg) {
          const [sh, sm] = startPeriodCfg.startTime.split(':').map(Number);
          const [eh, em] = endPeriodCfg.endTime.split(':').map(Number);

          const sTime = new Date(currentDate);
          sTime.setHours(sh, sm, 0, 0);
          sessionStartMs = sTime.getTime();

          const eTime = new Date(currentDate);
          eTime.setHours(eh, em, 0, 0);
          sessionEndMs = eTime.getTime();
        }

        for (const student of students) {
          const attKey = `${session._id}-${student._id}`;
          if (attendanceSet.has(attKey)) continue;

          const behavior = this.randomBehavior();
          let status = 'present';
          let checkInTime: Date | null = null;
          let checkOutTime: Date | null = null;
          let note: string | null = null;

          const randomIp = pick(ipList);
          const randomDist = randomInt(3, 18);
          const deviceInfo = `IP: ${randomIp} | GPS Dist: ${randomDist}m`;

          switch (behavior) {
            case 'present': {
              status = 'present';
              checkInTime = new Date(sessionStartMs + randomInt(-5 * 60000, 4 * 60000));
              checkOutTime = new Date(sessionEndMs + randomInt(0, 10 * 60000));
              break;
            }
            case 'late': {
              status = 'late';
              checkInTime = new Date(sessionStartMs + randomInt(6 * 60000, 25 * 60000));
              checkOutTime = new Date(sessionEndMs + randomInt(0, 10 * 60000));
              note = pick([
                'Tắc đường đoạn Cầu Giấy',
                'Xe máy bị hỏng giữa đường',
                'Đi xe bus bị trễ chuyến',
                'Gặp sự cố giao thông trên đường đến trường',
              ]);
              break;
            }
            case 'early_leave': {
              status = 'early_leave';
              checkInTime = new Date(sessionStartMs + randomInt(-5 * 60000, 4 * 60000));
              checkOutTime = new Date(sessionEndMs - randomInt(15 * 60000, 45 * 60000));
              note = pick([
                'Xin về sớm đi khám bệnh theo lịch hẹn',
                'Em bị đau đầu xin về sớm nghỉ ngơi',
                'Gia đình có việc đột xuất cần về gấp',
              ]);
              break;
            }
            case 'excused': {
              status = 'excused';
              checkInTime = null;
              checkOutTime = null;
              note = 'Nghỉ học có đơn xin phép được duyệt';
              break;
            }
            default: {
              status = 'absent';
              checkInTime = null;
              checkOutTime = null;
              break;
            }
          }

          attendancesBulk.push({
            classSessionId: new Types.ObjectId(String(session._id)),
            courseSectionId: new Types.ObjectId(String(section._id)),
            studentId: new Types.ObjectId(String(student._id)),
            checkInTime,
            checkOutTime,
            status,
            method: 'self',
            deviceInfo,
            note,
            createdAt: checkInTime || currentDate,
            updatedAt: checkOutTime || currentDate,
          });

          attendanceSet.add(attKey);
        }
      }
    }

    if (attendancesBulk.length > 0) {
      await this.attendanceModel.insertMany(attendancesBulk);
    }

    const elapsed = ((Date.now() - startOverall) / 1000).toFixed(2);
    this.logger.log(`⚡ HOÀN THÀNH SEED 1 THÁNG (30 NGÀY) TRONG ${elapsed} GIÂY:`);
    this.logger.log(`   - Số bản ghi điểm danh mới bổ sung: ${attendancesBulk.length} bản ghi!`);
  }

  private randomBehavior(): 'present' | 'late' | 'early_leave' | 'absent' | 'excused' {
    const r = Math.random() * 100;
    if (r < 70) return 'present';
    if (r < 85) return 'late';
    if (r < 93) return 'early_leave';
    if (r < 97) return 'absent';
    return 'excused';
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
