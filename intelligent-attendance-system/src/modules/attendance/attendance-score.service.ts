import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { AttendanceConfig, AttendanceConfigDocument } from './schemas/attendance-config.schema';
import { ClassSession, ClassSessionDocument } from '../academic/course-section/schemas/class-session.schema';
import { Enrollment, EnrollmentDocument } from '../academic/student/schemas/enrollment.schema';
import { CourseSection, CourseSectionDocument } from '../academic/course-section/schemas/course-section.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

export interface ScoreConfig {
  initialScore: number;
  absentPenalty: number;
  latePenalty: number;
  earlyLeavePenalty: number;
  excusedPenalty: number;
  examBanThreshold: number;
}

export interface StudentAttendanceScoreResult {
  studentId: string;
  student: {
    _id: string;
    fullName: string;
    userCode: string;
    email: string;
    avatarUrl?: string;
  };
  courseSectionId: string;
  courseSection?: {
    sectionCode: string;
    subjectName: string;
    subjectCode: string;
  };
  totalSessions: number;
  pastSessionsCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  earlyLeaveCount: number;
  attendanceRate: number;
  absenceRate: number;
  attendanceScore: number;
  examBanRisk: boolean;
  examBanThreshold: number;
  scoreFormula: string;
  config: ScoreConfig;
}

export interface ClassAttendanceScoresResult {
  courseSectionId: string;
  sectionCode: string;
  subjectName: string;
  totalStudents: number;
  totalSessions: number;
  examBanRiskCount: number;
  averageScore: number;
  config: ScoreConfig;
  students: StudentAttendanceScoreResult[];
}

@Injectable()
export class AttendanceScoreService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(AttendanceConfig.name)
    private attendanceConfigModel: Model<AttendanceConfigDocument>,
    @InjectModel(ClassSession.name)
    private classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(CourseSection.name)
    private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  /**
   * Lấy cấu hình tính điểm chuyên cần hiệu lực (Ưu tiên DB configuration, fallback default)
   */
  async getEffectiveScoreConfig(): Promise<ScoreConfig> {
    const config = await this.attendanceConfigModel.findOne({ isActive: true }).lean();

    return {
      initialScore: config?.initialScore ?? 10,
      absentPenalty: config?.absentPenalty ?? 2.0,
      latePenalty: config?.latePenalty ?? 0.5,
      earlyLeavePenalty: config?.earlyLeavePenalty ?? 0.5,
      excusedPenalty: config?.excusedPenalty ?? 0.0,
      examBanThreshold: config?.examBanThreshold ?? 20.0,
    };
  }

  /**
   * Tính điểm chuyên cần chi tiết cho một sinh viên trong một lớp học phần
   */
  async calculateStudentScore(
    studentId: string,
    courseSectionId: string,
    currentUser?: any,
  ): Promise<StudentAttendanceScoreResult> {
    if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(courseSectionId)) {
      throw new BadRequestException('Mã sinh viên hoặc mã lớp học phần không hợp lệ.');
    }

    // Kiểm tra phân quyền: sinh viên chỉ được phép xem điểm của chính mình
    if (currentUser) {
      const userRole =
        currentUser.roleCode ||
        currentUser.roleId?.code ||
        currentUser.role?.code ||
        (typeof currentUser.role === 'string' ? currentUser.role : '');
      const currentUserId = (currentUser._id || currentUser.id || currentUser.userId)?.toString();

      if (userRole === 'student' && currentUserId !== studentId.toString()) {
        throw new ForbiddenException('Bạn chỉ có quyền xem điểm chuyên cần của chính bản thân mình.');
      }
    }

    const studentObjId = new Types.ObjectId(studentId);
    const courseSectionObjId = new Types.ObjectId(courseSectionId);

    const [student, courseSection, sessions, attendances, config] = await Promise.all([
      this.userModel.findById(studentObjId).select('fullName userCode email avatarUrl').lean(),
      this.courseSectionModel.findById(courseSectionObjId).populate('subjectId', 'name code').lean(),
      this.classSessionModel
        .find({ courseSectionId: courseSectionObjId, status: { $ne: 'cancelled' } })
        .sort({ date: 1 })
        .lean(),
      this.attendanceModel
        .find({ studentId: studentObjId, courseSectionId: courseSectionObjId })
        .lean(),
      this.getEffectiveScoreConfig(),
    ]);

    if (!student) {
      throw new NotFoundException('Không tìm thấy thông tin sinh viên.');
    }

    if (!courseSection) {
      throw new NotFoundException('Không tìm thấy lớp học phần.');
    }

    const totalSessions = sessions.length;
    const now = new Date();

    // Map các buổi học đã có bản ghi điểm danh
    const attendanceMap = new Map<string, any>();
    for (const att of attendances) {
      attendanceMap.set(att.classSessionId.toString(), att);
    }

    let presentCount = 0;
    let lateCount = 0;
    let earlyLeaveCount = 0;
    let excusedCount = 0;
    let absentCount = 0;
    let pastSessionsCount = 0;

    // Duyệt qua từng buổi học của môn
    for (const sess of sessions) {
      const isPastSession = new Date(sess.date) <= now;
      if (isPastSession) {
        pastSessionsCount++;
      }

      const att = attendanceMap.get(sess._id.toString());
      if (att) {
        switch (att.status) {
          case 'present':
            presentCount++;
            break;
          case 'late':
            lateCount++;
            break;
          case 'early_leave':
            earlyLeaveCount++;
            break;
          case 'excused':
            excusedCount++;
            break;
          case 'absent':
          default:
            absentCount++;
            break;
        }
      } else if (isPastSession) {
        // Buổi học đã diễn ra nhưng sinh viên chưa điểm danh -> tính là vắng mặt
        absentCount++;
      }
    }

    // Nếu dữ liệu môn học chưa tạo buổi nào hoặc là demo
    const effectiveSessions = pastSessionsCount > 0 ? pastSessionsCount : totalSessions || attendances.length || 1;

    // Công thức tính điểm chuyên cần:
    // Score = initialScore - (absent * absentPenalty) - (late * latePenalty) - (earlyLeave * earlyLeavePenalty) - (excused * excusedPenalty)
    const rawScore =
      config.initialScore -
      absentCount * config.absentPenalty -
      lateCount * config.latePenalty -
      earlyLeaveCount * config.earlyLeavePenalty -
      excusedCount * config.excusedPenalty;

    // Giới hạn điểm: min = 0, max = initialScore (thang 10)
    const attendanceScore = Math.max(
      0,
      Math.min(config.initialScore, Math.round(rawScore * 100) / 100),
    );

    // Tỷ lệ tham gia và tỷ lệ vắng mặt
    const attendedCount = presentCount + lateCount + excusedCount + earlyLeaveCount;
    const attendanceRate = Number(((attendedCount / effectiveSessions) * 100).toFixed(1));
    const absenceRate = Number(((absentCount / effectiveSessions) * 100).toFixed(1));

    // Cờ cảnh báo nguy cơ cấm thi: absenceRate > configuredThreshold
    const examBanRisk = absenceRate > config.examBanThreshold;

    const subject = (courseSection as any).subjectId;

    return {
      studentId: student._id.toString(),
      student: {
        _id: student._id.toString(),
        fullName: student.fullName || 'N/A',
        userCode: student.userCode || 'N/A',
        email: student.email || '',
        avatarUrl: student.avatarUrl || undefined,
      },
      courseSectionId: courseSection._id.toString(),
      courseSection: {
        sectionCode: (courseSection as any).sectionCode || '',
        subjectName: subject?.name || 'Môn học',
        subjectCode: subject?.code || '',
      },
      totalSessions,
      pastSessionsCount,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      earlyLeaveCount,
      attendanceRate: Math.min(100, attendanceRate),
      absenceRate: Math.min(100, absenceRate),
      attendanceScore,
      examBanRisk,
      examBanThreshold: config.examBanThreshold,
      scoreFormula: `${config.initialScore} - (${absentCount} × ${config.absentPenalty}) - (${lateCount} × ${config.latePenalty}) - (${earlyLeaveCount} × ${config.earlyLeavePenalty}) - (${excusedCount} × ${config.excusedPenalty})`,
      config,
    };
  }

  /**
   * Tính điểm chuyên cần cho toàn bộ sinh viên trong một lớp học phần
   */
  async calculateClassScores(
    courseSectionId: string,
  ): Promise<ClassAttendanceScoresResult> {
    if (!Types.ObjectId.isValid(courseSectionId)) {
      throw new BadRequestException('Mã lớp học phần không hợp lệ.');
    }

    const courseSectionObjId = new Types.ObjectId(courseSectionId);

    const [courseSection, enrollments, config] = await Promise.all([
      this.courseSectionModel.findById(courseSectionObjId).populate('subjectId', 'name code').lean(),
      this.enrollmentModel
        .find({ courseSectionId: courseSectionObjId, status: 'enrolled' })
        .populate('studentId', 'fullName userCode email avatarUrl class')
        .lean(),
      this.getEffectiveScoreConfig(),
    ]);

    if (!courseSection) {
      throw new NotFoundException('Không tìm thấy lớp học phần.');
    }

    const studentsScores: StudentAttendanceScoreResult[] = [];

    // Tính điểm song song cho tất cả sinh viên
    for (const enrollment of enrollments) {
      const student = enrollment.studentId as any;
      if (!student || !student._id) continue;

      const score = await this.calculateStudentScore(
        student._id.toString(),
        courseSectionId,
      );
      studentsScores.push(score);
    }

    // Sắp xếp danh sách sinh viên: nguy cơ cấm thi lên đầu, sau đó theo điểm tăng dần
    studentsScores.sort((a, b) => {
      if (a.examBanRisk && !b.examBanRisk) return -1;
      if (!a.examBanRisk && b.examBanRisk) return 1;
      return a.attendanceScore - b.attendanceScore;
    });

    const totalStudents = studentsScores.length;
    const examBanRiskCount = studentsScores.filter((s) => s.examBanRisk).length;
    const totalScoreSum = studentsScores.reduce((acc, cur) => acc + cur.attendanceScore, 0);
    const averageScore = totalStudents > 0 ? Number((totalScoreSum / totalStudents).toFixed(2)) : 0;

    const subject = (courseSection as any).subjectId;

    return {
      courseSectionId,
      sectionCode: (courseSection as any).sectionCode || '',
      subjectName: subject?.name || 'Môn học',
      totalStudents,
      totalSessions: studentsScores[0]?.totalSessions || 0,
      examBanRiskCount,
      averageScore,
      config,
      students: studentsScores,
    };
  }
}
