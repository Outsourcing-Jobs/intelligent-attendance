import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from '../../attendance/schemas/attendance.schema';
import { CourseSection, CourseSectionDocument } from '../course-section/schemas/course-section.schema';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { Enrollment, EnrollmentDocument } from '../student/schemas/enrollment.schema';
import { PredictWarningDto } from './dto/predict-warning.dto';

export interface AttendanceFeatures {
  total_sessions: number;
  present_count: number;
  late_count: number;
  early_leave_count: number;
  excused_count: number;
  absent_count: number;
  attendance_rate: number;
  absence_rate: number;
  late_rate: number;
  recent_absence_rate: number;
  consecutive_absence: number;
  attendance_trend: number;
}

export interface WarningPredictionResult {
  student_id: string;
  course_section_id: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  riskProbability: number;
  model: string;
  prediction: number;
  riskLevel: {
    level: string;
    label: string;
    color: string;
    probability_range?: number[];
    description?: string;
  };
  recommendation: {
    for_student: string;
    for_lecturer: string;
  };
  features: AttendanceFeatures;
  is_fallback?: boolean;
}

@Injectable()
export class WarningService {
  private readonly logger = new Logger(WarningService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';

  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  /**
   * Tính toán vector 12 đặc trưng chuẩn xác theo chuỗi thời gian cho 1 sinh viên trong lớp học phần
   */
  async extractStudentFeatures(studentId: string, courseSectionId: string): Promise<AttendanceFeatures> {
    const studentObjectId = Types.ObjectId.isValid(studentId)
      ? new Types.ObjectId(studentId)
      : studentId;
    const courseObjectId = Types.ObjectId.isValid(courseSectionId)
      ? new Types.ObjectId(courseSectionId)
      : courseSectionId;

    const attendances = await this.attendanceModel
      .find({
        $or: [
          { studentId: studentObjectId, courseSectionId: courseObjectId },
          { studentId: studentId, courseSectionId: courseSectionId },
        ],
      })
      .sort({ createdAt: 1 })
      .lean();

    const total_sessions = attendances.length;
    if (total_sessions === 0) {
      return {
        total_sessions: 0,
        present_count: 0,
        late_count: 0,
        early_leave_count: 0,
        excused_count: 0,
        absent_count: 0,
        attendance_rate: 1.0,
        absence_rate: 0.0,
        late_rate: 0.0,
        recent_absence_rate: 0.0,
        consecutive_absence: 0,
        attendance_trend: 0.0,
      };
    }

    let present_count = 0;
    let late_count = 0;
    let early_leave_count = 0;
    let excused_count = 0;
    let absent_count = 0;

    for (const att of attendances) {
      switch (att.status) {
        case 'present':
          present_count++;
          break;
        case 'late':
          late_count++;
          break;
        case 'early_leave':
          early_leave_count++;
          break;
        case 'excused':
          excused_count++;
          break;
        case 'absent':
        default:
          absent_count++;
          break;
      }
    }

    const attendance_rate = Number(((present_count + excused_count) / total_sessions).toFixed(4));
    const absence_rate = Number((absent_count / total_sessions).toFixed(4));
    const late_rate = Number((late_count / total_sessions).toFixed(4));

    // recent_absence_rate (3 buổi gần nhất)
    const recentK = Math.min(3, total_sessions);
    let recentAbsents = 0;
    for (let i = total_sessions - 1; i >= total_sessions - recentK && i >= 0; i--) {
      if (attendances[i].status === 'absent') {
        recentAbsents++;
      }
    }
    const recent_absence_rate = recentK > 0 ? Number((recentAbsents / recentK).toFixed(4)) : 0.0;

    // consecutive_absence
    let consecutive_absence = 0;
    for (let i = total_sessions - 1; i >= 0; i--) {
      if (attendances[i].status === 'absent') {
        consecutive_absence++;
      } else {
        break;
      }
    }

    // attendance_trend (nửa sau - nửa trước)
    let attendance_trend = 0.0;
    if (total_sessions >= 2) {
      const mid = Math.floor(total_sessions / 2);
      const firstHalf = attendances.slice(0, mid);
      const secondHalf = attendances.slice(mid);

      const firstRate =
        firstHalf.filter((a) => a.status === 'present' || a.status === 'excused').length /
        firstHalf.length;
      const secondRate =
        secondHalf.filter((a) => a.status === 'present' || a.status === 'excused').length /
        secondHalf.length;

      attendance_trend = Number((secondRate - firstRate).toFixed(4));
    }

    return {
      total_sessions,
      present_count,
      late_count,
      early_leave_count,
      excused_count,
      absent_count,
      attendance_rate,
      absence_rate,
      late_rate,
      recent_absence_rate,
      consecutive_absence,
      attendance_trend,
    };
  }

  /**
   * Dự báo rủi ro chuyên cần cho 1 sinh viên (có timeout 3s & fallback an toàn)
   */
  async predictWarningForStudent(studentId: string, courseSectionId: string): Promise<WarningPredictionResult> {
    const features = await this.extractStudentFeatures(studentId, courseSectionId);

    // Trường hợp chưa có buổi học nào
    if (features.total_sessions === 0) {
      return {
        student_id: studentId,
        course_section_id: courseSectionId,
        risk: 'LOW',
        riskProbability: 0.0,
        model: 'Rule-based Initialization',
        prediction: 0,
        riskLevel: {
          level: 'LOW',
          label: 'An toàn',
          color: 'green',
          description: 'Lớp học phần chưa có buổi điểm danh nào.',
        },
        recommendation: {
          for_student: 'Lớp học phần chưa diễn ra buổi điểm danh nào.',
          for_lecturer: 'Chưa có dữ liệu điểm danh thực tế.',
        },
        features,
      };
    }

    // 1. Thử gọi FastAPI AI Service qua HTTP POST với timeout 3s
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.aiServiceUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          course_section_id: courseSectionId,
          features,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json && json.risk) {
          return {
            student_id: studentId,
            course_section_id: courseSectionId,
            risk: json.risk,
            riskProbability: json.riskProbability,
            model: json.model || 'Random Forest',
            prediction: json.prediction ?? (json.risk === 'HIGH' ? 1 : 0),
            riskLevel: json.riskLevel,
            recommendation: json.recommendation,
            features,
            is_fallback: false,
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(
        `AI Service offline hoặc quá hạn timeout (${this.aiServiceUrl}): ${err.message}. Tự động kích hoạt Rule-based Fallback Engine.`
      );
    }

    // 2. Fallback Engine an toàn (Rule-based kết hợp quy chế học vụ)
    return this.fallbackPrediction(studentId, courseSectionId, features);
  }

  /**
   * Quy tắc dự báo Fallback an toàn khi AI Service không phản hồi
   */
  private fallbackPrediction(
    studentId: string,
    courseSectionId: string,
    features: AttendanceFeatures,
  ): WarningPredictionResult {
    let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let riskProbability = 0.05;
    let label = 'An toàn';
    let color = 'green';
    let description = 'Tỷ lệ chuyên cần ổn định.';

    if (
      features.absence_rate >= 0.20 ||
      features.consecutive_absence >= 3 ||
      features.absent_count >= 4
    ) {
      risk = 'HIGH';
      riskProbability = Math.min(0.95, 0.70 + features.absence_rate * 0.25);
      label = 'Nguy cơ cao';
      color = 'red';
      description = 'Đã đạt hoặc vượt ngưỡng cấm thi (>20% vắng) hoặc chuỗi vắng liên tiếp nghiêm trọng.';
    } else if (
      features.absence_rate >= 0.10 ||
      features.consecutive_absence >= 2 ||
      features.late_count >= 3
    ) {
      risk = 'MEDIUM';
      riskProbability = Math.min(0.68, 0.35 + features.absence_rate * 0.3);
      label = 'Cần chú ý';
      color = 'yellow';
      description = 'Bắt đầu có dấu hiệu vắng mặt hoặc đi muộn nhiều, cần nhắc nhở sớm.';
    }

    const rec = this.generateFallbackRecommendations(risk, features);

    return {
      student_id: studentId,
      course_section_id: courseSectionId,
      risk,
      riskProbability: Number(riskProbability.toFixed(4)),
      model: 'Rule-based Fallback Engine',
      prediction: risk === 'HIGH' ? 1 : 0,
      riskLevel: {
        level: risk,
        label,
        color,
        description,
      },
      recommendation: rec,
      features,
      is_fallback: true,
    };
  }

  private generateFallbackRecommendations(
    risk: 'LOW' | 'MEDIUM' | 'HIGH',
    features: AttendanceFeatures,
  ) {
    if (risk === 'HIGH') {
      return {
        for_student: `CẢNH BÁO NGUY CƠ CAO: Bạn đã vắng ${features.absent_count}/${features.total_sessions} buổi (${(features.absence_rate * 100).toFixed(1)}%). Bạn đang đối mặt với NGUY CƠ BỊ CẤM THI học phần này. Cần liên hệ ngay Giảng viên hoặc Cố vấn học tập!`,
        for_lecturer: `Sinh viên có nguy cơ cấm thi rất cao (vắng ${features.absent_count}/${features.total_sessions} buổi, vắng ${features.consecutive_absence} buổi liên tiếp). Đề xuất nhắc nhở trực tiếp và đưa vào danh sách theo dõi đặc biệt.`,
      };
    }
    if (risk === 'MEDIUM') {
      return {
        for_student: `LƯU Ý CHUYÊN CẦN: Bạn đã vắng ${features.absent_count} buổi, đi muộn ${features.late_count} buổi. Hãy duy trì đi học đầy đủ để đảm bảo đủ điều kiện dự thi kết thúc học phần.`,
        for_lecturer: `Sinh viên ở mức cảnh báo trung bình (tỷ lệ vắng ${(features.absence_rate * 100).toFixed(1)}%). Nên gửi thông báo nhắc nhở sớm.`,
      };
    }
    return {
      for_student: `TỐT: Tinh thần chuyên cần của bạn rất tốt (đã tham gia ${features.total_sessions} buổi). Hãy tiếp tục phát huy!`,
      for_lecturer: `Sinh viên duy trì chuyên cần tốt. Không cần can thiệp.`,
    };
  }

  /**
   * Endpoint cũ tương thích PredictWarningDto
   */
  async predictWarning(dto: PredictWarningDto) {
    const courseSectionId = dto.course_section_id || dto.class_id;
    if (!courseSectionId) {
      throw new NotFoundException('Vui lòng cung cấp course_section_id hoặc class_id!');
    }
    return this.predictWarningForStudent(dto.student_id, courseSectionId);
  }

  /**
   * Lấy danh sách rủi ro và khuyến nghị của TOÀN BỘ sinh viên trong lớp học phần
   */
  async getClassWarnings(courseSectionId: string) {
    const courseObjectId = Types.ObjectId.isValid(courseSectionId)
      ? new Types.ObjectId(courseSectionId)
      : courseSectionId;

    // 1. Lấy danh sách sinh viên đăng ký lớp
    const enrollments = await this.enrollmentModel
      .find({
        $or: [{ courseSectionId: courseObjectId }, { courseSectionId: courseSectionId }],
        status: { $ne: 'cancelled' },
      })
      .populate('studentId', 'fullName email studentCode')
      .lean();

    const studentIds: string[] = [];
    const studentInfoMap = new Map<string, any>();

    for (const enr of enrollments) {
      const sId = String((enr.studentId as any)?._id || enr.studentId);
      studentIds.push(sId);
      studentInfoMap.set(sId, {
        studentId: sId,
        fullName: (enr.studentId as any)?.fullName || 'N/A',
        studentCode: (enr.studentId as any)?.studentCode || '',
        email: (enr.studentId as any)?.email || '',
      });
    }

    // Nếu không có enrollments, tìm qua attendances
    if (studentIds.length === 0) {
      const distinctStudents = await this.attendanceModel.distinct('studentId', {
        $or: [{ courseSectionId: courseObjectId }, { courseSectionId: courseSectionId }],
      });
      for (const sId of distinctStudents) {
        const idStr = String(sId);
        studentIds.push(idStr);
        studentInfoMap.set(idStr, { studentId: idStr, fullName: 'Sinh viên', studentCode: '' });
      }
    }

    // 2. Dự báo rủi ro cho từng sinh viên song song
    const predictions = await Promise.all(
      studentIds.map(async (sId) => {
        try {
          const pred = await this.predictWarningForStudent(sId, courseSectionId);
          const info = studentInfoMap.get(sId) || {};
          return {
            ...pred,
            ...info,
          };
        } catch (e) {
          return null;
        }
      })
    );

    const validPredictions = predictions.filter((p) => p !== null);

    const high_count = validPredictions.filter((p) => p.risk === 'HIGH').length;
    const medium_count = validPredictions.filter((p) => p.risk === 'MEDIUM').length;
    const low_count = validPredictions.filter((p) => p.risk === 'LOW').length;

    return {
      course_section_id: courseSectionId,
      total_students: validPredictions.length,
      summary: {
        high_risk_count: high_count,
        medium_risk_count: medium_count,
        low_risk_count: low_count,
      },
      students: validPredictions,
    };
  }

  /**
   * Thống kê tương thích endpoint cũ
   */
  async getClassWarningStats(courseSectionId: string) {
    return this.getClassWarnings(courseSectionId);
  }
}
