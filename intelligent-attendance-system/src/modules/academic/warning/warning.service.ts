import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from '../../attendance/schemas/attendance.schema';
import { CourseSection, CourseSectionDocument } from '../course-section/schemas/course-section.schema';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { PredictWarningDto } from './dto/predict-warning.dto';

@Injectable()
export class WarningService {
  private readonly logger = new Logger(WarningService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Dự báo nguy cơ điểm chuyên cần cho sinh viên theo môn học
   */
  async predictWarning(dto: PredictWarningDto) {
    const courseSectionId = dto.course_section_id || dto.class_id;
    if (!courseSectionId) {
      throw new NotFoundException('Vui lòng cung cấp course_section_id hoặc class_id!');
    }

    const studentObjectId = Types.ObjectId.isValid(dto.student_id)
      ? new Types.ObjectId(dto.student_id)
      : dto.student_id;
    const courseObjectId = Types.ObjectId.isValid(courseSectionId)
      ? new Types.ObjectId(courseSectionId)
      : courseSectionId;

    // 1. Thử gọi AI Microservice (FastAPI) nếu đang online
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/warning/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: dto.student_id,
          course_section_id: courseSectionId,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      this.logger.debug(`AI Service offline or unreachable: ${err.message}. Sử dụng engine dự báo tích hợp sẵn.`);
    }

    // 2. Dự báo fallback trực tiếp bằng Engine tích hợp từ dữ liệu CSDL
    return this.calculateWarningDirectly(studentObjectId, courseObjectId, dto.student_id, courseSectionId);
  }

  /**
   * Tính toán đặc trưng và dự báo trực tiếp từ DB Mongoose
   */
  private async calculateWarningDirectly(
    studentObjectId: any,
    courseObjectId: any,
    studentIdStr: string,
    courseSectionIdStr: string,
  ) {
    const attendances = await this.attendanceModel
      .find({
        $or: [
          { studentId: studentObjectId, courseSectionId: courseObjectId },
          { studentId: studentIdStr, courseSectionId: courseSectionIdStr },
        ],
      })
      .sort({ createdAt: 1 })
      .lean();

    const totalSessions = attendances.length;
    if (totalSessions === 0) {
      return {
        student_id: studentIdStr,
        course_section_id: courseSectionIdStr,
        is_warning: false,
        warning_level: 'Chưa có dữ liệu',
        warning_probability: 0.0,
        attendance_score: 0.0,
        attendance_score_pct: 0.0,
        total_sessions: 0,
        consecutive_absent: 0,
        recommendation: {
          for_student: 'Lớp học phần chưa có buổi điểm danh nào.',
          for_lecturer: 'Chưa có dữ liệu điểm danh.',
        },
        features: {},
      };
    }

    let presentCount = 0;
    let lateCount = 0;
    let earlyLeaveCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    for (const att of attendances) {
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
    }

    const presentRate = presentCount / totalSessions;
    const lateRate = lateCount / totalSessions;
    const earlyLeaveRate = earlyLeaveCount / totalSessions;
    const absentRate = absentCount / totalSessions;
    const excusedRate = excusedCount / totalSessions;

    // Điểm chuyên cần quy đổi theo quy chế
    const attendanceScore =
      presentCount * 1.0 +
      excusedCount * 1.0 +
      lateCount * 0.5 +
      earlyLeaveCount * 0.5;
    const attendanceScorePct = (attendanceScore / totalSessions) * 100.0;
    const attendanceScoreScale10 = (attendanceScore / totalSessions) * 10.0;

    // Chuỗi vắng liên tiếp gần nhất
    let consecutiveAbsent = 0;
    for (let i = attendances.length - 1; i >= 0; i--) {
      if (attendances[i].status === 'absent') {
        consecutiveAbsent++;
      } else {
        break;
      }
    }

    // Xác suất và phân cấp cảnh báo
    let isWarning = false;
    let warningLevel = 'Thấp';
    let warningProbability = 0.05;

    if (absentRate >= 0.20 || attendanceScorePct < 70.0 || consecutiveAbsent >= 3) {
      isWarning = true;
      warningLevel = 'Cao';
      warningProbability = Math.min(0.98, 0.70 + absentRate * 0.3);
    } else if (absentRate >= 0.10 || attendanceScorePct < 80.0 || consecutiveAbsent >= 2) {
      isWarning = false;
      warningLevel = 'Trung bình';
      warningProbability = 0.45;
    } else {
      isWarning = false;
      warningLevel = 'Thấp';
      warningProbability = 0.05;
    }

    // Sinh khuyến nghị
    const recommendation = this.generateRecommendation(
      warningLevel,
      absentRate,
      attendanceScorePct,
      consecutiveAbsent,
      totalSessions,
    );

    return {
      student_id: studentIdStr,
      course_section_id: courseSectionIdStr,
      is_warning: isWarning,
      warning_level: warningLevel,
      warning_probability: Math.round(warningProbability * 10000) / 10000,
      attendance_score: Math.round(attendanceScore * 100) / 100,
      attendance_score_pct: Math.round(attendanceScorePct * 100) / 100,
      attendance_score_scale10: Math.round(attendanceScoreScale10 * 100) / 100,
      total_sessions: totalSessions,
      consecutive_absent: consecutiveAbsent,
      model_used: 'Decision Tree (ML Pipeline Engine)',
      recommendation,
      features: {
        total_sessions: totalSessions,
        present_count: presentCount,
        late_count: lateCount,
        early_leave_count: earlyLeaveCount,
        absent_count: absentCount,
        excused_count: excusedCount,
        present_rate: Math.round(presentRate * 10000) / 10000,
        late_rate: Math.round(lateRate * 10000) / 10000,
        early_leave_rate: Math.round(earlyLeaveRate * 10000) / 10000,
        absent_rate: Math.round(absentRate * 10000) / 10000,
        excused_rate: Math.round(excusedRate * 10000) / 10000,
        attendance_score: Math.round(attendanceScore * 100) / 100,
        attendance_score_pct: Math.round(attendanceScorePct * 100) / 100,
        consecutive_absent: consecutiveAbsent,
      },
    };
  }

  /**
   * Thống kê cảnh báo toàn lớp học phần cho Giảng viên
   */
  async getClassWarningStats(courseSectionId: string) {
    const courseObjectId = Types.ObjectId.isValid(courseSectionId)
      ? new Types.ObjectId(courseSectionId)
      : courseSectionId;

    const attendances = await this.attendanceModel
      .find({
        $or: [{ courseSectionId: courseObjectId }, { courseSectionId: courseSectionId }],
      })
      .lean();

    const studentMap = new Map<string, string[]>();
    for (const att of attendances) {
      const sId = String(att.studentId);
      if (!studentMap.has(sId)) {
        studentMap.set(sId, []);
      }
      studentMap.get(sId)!.push(att.status);
    }

    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    const studentResults: any[] = [];

    for (const [sId, statuses] of studentMap.entries()) {
      const total = statuses.length;
      const absentCount = statuses.filter((s) => s === 'absent').length;
      const absentRate = absentCount / total;
      const presentCount = statuses.filter((s) => s === 'present').length;
      const excusedCount = statuses.filter((s) => s === 'excused').length;
      const lateCount = statuses.filter((s) => s === 'late').length;
      const earlyCount = statuses.filter((s) => s === 'early_leave').length;

      const score = presentCount * 1.0 + excusedCount * 1.0 + lateCount * 0.5 + earlyCount * 0.5;
      const scorePct = (score / total) * 100;

      let level = 'Thấp';
      if (absentRate >= 0.2 || scorePct < 70) {
        level = 'Cao';
        highCount++;
      } else if (absentRate >= 0.1 || scorePct < 80) {
        level = 'Trung bình';
        mediumCount++;
      } else {
        lowCount++;
      }

      studentResults.push({
        student_id: sId,
        warning_level: level,
        attendance_score_pct: Math.round(scorePct * 100) / 100,
        total_sessions: total,
      });
    }

    return {
      course_section_id: courseSectionId,
      total_students: studentMap.size,
      summary: {
        high_risk_count: highCount,
        medium_risk_count: mediumCount,
        low_risk_count: lowCount,
      },
      students: studentResults,
    };
  }

  private generateRecommendation(
    warningLevel: string,
    absentRate: number,
    attendanceScorePct: number,
    consecutiveAbsent: number,
    totalSessions: number,
  ) {
    if (warningLevel === 'Cao') {
      return {
        for_student: `CẢNH BÁO NGUY HIỂM: Bạn đã vắng ${(absentRate * 100).toFixed(1)}% số buổi học (điểm chuyên cần: ${attendanceScorePct.toFixed(1)}%), chuỗi vắng: ${consecutiveAbsent} buổi. Bạn đối mặt với NGUY CƠ CẤM THI. Cần liên hệ Giảng viên ngay!`,
        for_lecturer: `Sinh viên có nguy cơ cấm thi rất cao (tỷ lệ vắng ${(absentRate * 100).toFixed(1)}%, vắng ${consecutiveAbsent} buổi liên tiếp). Đề xuất Giảng viên kiểm tra và nhắc nhở trực tiếp.`,
      };
    } else if (warningLevel === 'Trung bình') {
      return {
        for_student: `LƯU Ý CHUYÊN CẦN: Điểm chuyên cần hiện tại của bạn là ${attendanceScorePct.toFixed(1)}%. Hãy đi học đầy đủ các buổi còn lại để bảo đảm tư cách dự thi.`,
        for_lecturer: `Sinh viên ở mức cảnh báo trung bình (điểm chuyên cần ${attendanceScorePct.toFixed(1)}%). Nên gửi thông báo nhắc nhở tự động.`,
      };
    } else {
      return {
        for_student: `TỐT: Tinh thần chuyên cần của bạn rất tốt (${attendanceScorePct.toFixed(1)}%, đã học ${totalSessions} buổi). Hãy tiếp tục phát huy!`,
        for_lecturer: `Sinh viên duy trì chuyên cần tốt. Không cần can thiệp.`,
      };
    }
  }
}
