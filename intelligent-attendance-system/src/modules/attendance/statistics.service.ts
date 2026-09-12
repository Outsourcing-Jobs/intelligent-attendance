import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { LeaveRequest, LeaveRequestDocument } from './schemas/leave-request.schema';
import { ClassSession, ClassSessionDocument } from '../academic/course-section/schemas/class-session.schema';
import { CourseSection, CourseSectionDocument } from '../academic/course-section/schemas/course-section.schema';
import { Enrollment, EnrollmentDocument } from '../academic/student/schemas/enrollment.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Subject, SubjectDocument } from '../academic/subject/schemas/subject.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(ClassSession.name)
    private classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(CourseSection.name)
    private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
  ) {}

  /**
   * Thống kê Dashboard dành cho SINH VIÊN
   */
  async getStudentStatistics(studentId: string, semesterId?: string) {
    const studentObjId = Types.ObjectId.isValid(studentId) ? new Types.ObjectId(studentId) : null;

    // 1. Lấy các lớp học phần của sinh viên
    let enrollments = await this.enrollmentModel
      .find({ ...(studentObjId ? { studentId: studentObjId } : {}), status: 'enrolled' })
      .populate({
        path: 'courseSectionId',
        populate: { path: 'subjectId' },
      })
      .lean();

    if (!enrollments.length) {
      enrollments = await this.enrollmentModel
        .find({ status: 'enrolled' })
        .populate({
          path: 'courseSectionId',
          populate: { path: 'subjectId' },
        })
        .lean();
    }

    const courseSectionIds = enrollments.map((e: any) => e.courseSectionId?._id).filter(Boolean);

    // 2. Lấy tất cả các buổi học
    let sessions = await this.classSessionModel
      .find({
        ...(courseSectionIds.length > 0 ? { courseSectionId: { $in: courseSectionIds } } : {}),
        status: { $ne: 'cancelled' },
      })
      .lean();

    if (!sessions.length) {
      sessions = await this.classSessionModel.find({ status: { $ne: 'cancelled' } }).lean();
    }

    const sessionIds = sessions.map((s) => s._id);

    // 3. Lấy bản ghi điểm danh
    const attendances = await this.attendanceModel
      .find({
        ...(studentObjId ? { studentId: studentObjId } : {}),
        classSessionId: { $in: sessionIds },
      })
      .lean();

    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;

    const sessionStatusMap = new Map();
    attendances.forEach((att) => {
      sessionStatusMap.set(att.classSessionId.toString(), att.status);
    });

    sessions.forEach((sess) => {
      const status = sessionStatusMap.get(sess._id.toString());
      if (status === 'present') present++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
      else if (status === 'absent' || status === 'early_leave') absent++;
      else absent++;
    });

    const totalSessions = sessions.length;
    const attendedCount = present + late + excused;
    const attendanceRate = totalSessions > 0 ? Number(((attendedCount / totalSessions) * 100).toFixed(1)) : 100;

    // 4. Thống kê Đơn xin nghỉ phép
    const leaveRequests = await this.leaveRequestModel
      .find(studentObjId ? { studentId: studentObjId } : {})
      .lean();

    const leaveStats = {
      total: leaveRequests.length,
      pending: leaveRequests.filter((r) => r.status === 'pending').length,
      approved: leaveRequests.filter((r) => r.status === 'approved').length,
      rejected: leaveRequests.filter((r) => r.status === 'rejected').length,
      cancelled: leaveRequests.filter((r) => r.status === 'cancelled').length,
    };

    const leaveTypeChart = [
      { name: 'Nghỉ ốm', value: leaveRequests.filter((r) => r.leaveType === 'sick').length || 0, color: '#EF4444' },
      { name: 'Việc cá nhân', value: leaveRequests.filter((r) => r.leaveType === 'personal').length || 0, color: '#F59E0B' },
      { name: 'Gia đình', value: leaveRequests.filter((r) => r.leaveType === 'family').length || 0, color: '#8B5CF6' },
      { name: 'Khác', value: leaveRequests.filter((r) => r.leaveType === 'other').length || 0, color: '#6B7280' },
    ];

    // Thống kê theo môn học
    const subjectStatsMap = new Map<string, any>();

    enrollments.forEach((e: any) => {
      const section = e.courseSectionId;
      if (!section) return;
      const subject = section.subjectId;
      const subId = subject?._id?.toString() || section._id?.toString() || 'SUB';

      if (!subjectStatsMap.has(subId)) {
        subjectStatsMap.set(subId, {
          subjectId: subId,
          subjectCode: subject?.code || 'N/A',
          subjectName: subject?.name || section.sectionCode || 'Môn học',
          sectionCode: section.sectionCode,
          totalSessions: 0,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
          rate: 100,
        });
      }
    });

    sessions.forEach((sess) => {
      const secId = sess.courseSectionId?.toString();
      const enrollment = enrollments.find((e: any) => e.courseSectionId?._id?.toString() === secId);
      const subject = (enrollment?.courseSectionId as any)?.subjectId;
      const subId = subject?._id?.toString() || secId || 'SUB';

      const subStat = subjectStatsMap.get(subId);
      if (subStat) {
        subStat.totalSessions += 1;
        const st = sessionStatusMap.get(sess._id.toString());
        if (st === 'present') subStat.present += 1;
        else if (st === 'late') subStat.late += 1;
        else if (st === 'excused') subStat.excused += 1;
        else subStat.absent += 1;
      }
    });

    subjectStatsMap.forEach((val) => {
      const total = val.totalSessions;
      const attended = val.present + val.late + val.excused;
      val.rate = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100;
    });

    return {
      kpi: {
        totalSessions,
        present,
        late,
        absent,
        excused,
        attendanceRate,
        leaveStats,
      },
      chart: [
        { name: 'Có mặt', value: present, color: '#10B981' },
        { name: 'Đi muộn', value: late, color: '#F59E0B' },
        { name: 'Vắng mặt', value: absent, color: '#EF4444' },
        { name: 'Có phép', value: excused, color: '#3B82F6' },
      ],
      leaveTypeChart,
      subjects: Array.from(subjectStatsMap.values()),
    };
  }

  /**
   * Thống kê Dashboard dành cho GIẢNG VIÊN
   */
  async getTeacherStatistics(teacherId: string, courseSectionId?: string) {
    const teacherObjId = Types.ObjectId.isValid(teacherId) ? new Types.ObjectId(teacherId) : null;

    let sections = await this.courseSectionModel
      .find({
        ...(teacherObjId ? { $or: [{ lecturerId: teacherObjId }, { lecturers: teacherObjId }] } : {}),
        ...(courseSectionId && Types.ObjectId.isValid(courseSectionId)
          ? { _id: new Types.ObjectId(courseSectionId) }
          : {}),
      })
      .populate('subjectId', 'name code')
      .lean();

    if (!sections.length) {
      sections = await this.courseSectionModel
        .find({
          ...(courseSectionId && Types.ObjectId.isValid(courseSectionId)
            ? { _id: new Types.ObjectId(courseSectionId) }
            : {}),
        })
        .populate('subjectId', 'name code')
        .lean();
    }

    const sectionIds = sections.map((s) => s._id);

    // Lấy danh sách ghi danh
    let enrollments = await this.enrollmentModel
      .find({
        courseSectionId: { $in: sectionIds },
        status: 'enrolled',
      })
      .populate('studentId', 'fullName userCode email avatarUrl class')
      .populate('courseSectionId', 'sectionCode')
      .lean();

    if (!enrollments.length) {
      enrollments = await this.enrollmentModel
        .find({ status: 'enrolled' })
        .populate('studentId', 'fullName userCode email avatarUrl class')
        .populate('courseSectionId', 'sectionCode')
        .lean();
    }

    const studentMap = new Map<string, any>();
    const studentSectionCodeMap = new Map<string, string>();
    enrollments.forEach((e: any) => {
      if (e.studentId && e.studentId._id) {
        const sId = e.studentId._id.toString();
        studentMap.set(sId, e.studentId);
        if (e.courseSectionId && e.courseSectionId.sectionCode) {
          studentSectionCodeMap.set(sId, e.courseSectionId.sectionCode);
        }
      }
    });

    const totalStudents = studentMap.size;
    const totalCourseSections = sections.length;

    // Các buổi học
    const sessions = await this.classSessionModel
      .find({
        ...(sectionIds.length > 0 ? { courseSectionId: { $in: sectionIds } } : {}),
        status: { $ne: 'cancelled' },
      })
      .lean();

    const sessionIds = sessions.map((s) => s._id);
    const totalSessions = sessions.length;

    // Bản ghi điểm danh
    const attendances = await this.attendanceModel
      .find({
        ...(sessionIds.length > 0 ? { classSessionId: { $in: sessionIds } } : {}),
      })
      .lean();

    const totalAttendanceRecords = attendances.length;

    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;

    attendances.forEach((att) => {
      if (att.status === 'present') present++;
      else if (att.status === 'late') late++;
      else if (att.status === 'excused') excused++;
      else if (att.status === 'absent' || att.status === 'early_leave') absent++;
    });

    // Thống kê Đơn xin nghỉ phép
    const allLeaveRequests = await this.leaveRequestModel.find().lean();
    const pendingLeaveCount = allLeaveRequests.filter((r) => r.status === 'pending').length;
    const approvedLeaveCount = allLeaveRequests.filter((r) => r.status === 'approved').length;
    const rejectedLeaveCount = allLeaveRequests.filter((r) => r.status === 'rejected').length;

    const leaveStatusChart = [
      { name: 'Chờ duyệt', value: pendingLeaveCount, color: '#F59E0B' },
      { name: 'Đã duyệt (Excused)', value: approvedLeaveCount, color: '#10B981' },
      { name: 'Từ chối', value: rejectedLeaveCount, color: '#EF4444' },
    ];

    // Xếp loại điểm danh sinh viên & Đánh giá Risk
    const studentStatsMap = new Map<string, any>();

    studentMap.forEach((student, sId) => {
      studentStatsMap.set(sId, {
        studentId: sId,
        userCode: student.userCode || 'SV',
        fullName: student.fullName || 'Sinh viên',
        email: student.email || '',
        avatarUrl: student.avatarUrl || null,
        className: student.class || studentSectionCodeMap.get(sId) || 'CS-24H-TEST',
        totalSessions: totalSessions > 0 ? totalSessions : 1,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        attendanceRate: 100,
        risk: 'NORMAL',
      });
    });

    attendances.forEach((att) => {
      const sId = att.studentId?.toString();
      const stat = studentStatsMap.get(sId);
      if (stat) {
        if (att.status === 'present') stat.present++;
        else if (att.status === 'late') stat.late++;
        else if (att.status === 'excused') stat.excused++;
        else if (att.status === 'absent' || att.status === 'early_leave') stat.absent++;
      }
    });

    const ranking = Array.from(studentStatsMap.values()).map((stat) => {
      const total = totalSessions > 0 ? totalSessions : (stat.present + stat.late + stat.absent + stat.excused) || 1;
      const attended = stat.present + stat.late + stat.excused;
      const rate = Number(((attended / total) * 100).toFixed(1));
      stat.attendanceRate = rate;

      // Số buổi vắng mặt phải khớp chính xác: Tổng buổi - (Đúng giờ + Muộn + Có phép)
      stat.absent = Math.max(0, total - attended);

      if (rate >= 80) stat.risk = 'NORMAL';
      else if (rate >= 60) stat.risk = 'WARNING';
      else stat.risk = 'DANGER';

      return stat;
    });

    ranking.sort((a, b) => a.attendanceRate - b.attendanceRate);

    // Tính toán tổng số lượt theo từng trạng thái khớp với toàn bộ sinh viên
    let totalPresentSlots = 0;
    let totalLateSlots = 0;
    let totalExcusedSlots = 0;
    let totalAbsentSlots = 0;

    ranking.forEach((r) => {
      totalPresentSlots += r.present;
      totalLateSlots += r.late;
      totalExcusedSlots += r.excused;
      totalAbsentSlots += r.absent;
    });

    return {
      kpi: {
        totalStudents,
        totalCourseSections,
        totalSessions,
        totalAttendanceRecords,
        pendingLeaveCount,
        approvedLeaveCount,
        totalLeaveRequests: allLeaveRequests.length,
      },
      chart: [
        { name: 'Đúng giờ', value: totalPresentSlots, color: '#10B981' },
        { name: 'Đi muộn', value: totalLateSlots, color: '#F59E0B' },
        { name: 'Vắng mặt', value: totalAbsentSlots, color: '#EF4444' },
        { name: 'Có phép', value: totalExcusedSlots, color: '#3B82F6' },
      ],
      leaveStatusChart,
      studentRanking: ranking,
    };
  }

  /**
   * Thống kê Dashboard tổng quan dành cho ADMIN
   */
  async getAdminStatistics() {
    const [
      totalStudents,
      totalTeachers,
      totalSubjects,
      totalCourseSections,
      totalSessions,
      totalAttendanceRecords,
      allLeaveRequests,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: 'student' }),
      this.userModel.countDocuments({ role: 'teacher' }),
      this.subjectModel.countDocuments(),
      this.courseSectionModel.countDocuments(),
      this.classSessionModel.countDocuments({ status: { $ne: 'cancelled' } }),
      this.attendanceModel.countDocuments(),
      this.leaveRequestModel.find().lean(),
    ]);

    const pendingLeaveRequests = allLeaveRequests.filter((r) => r.status === 'pending').length;
    const approvedLeaveRequests = allLeaveRequests.filter((r) => r.status === 'approved').length;
    const rejectedLeaveRequests = allLeaveRequests.filter((r) => r.status === 'rejected').length;

    const attendances = await this.attendanceModel.find().select('status').lean();
    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;

    attendances.forEach((att) => {
      if (att.status === 'present') present++;
      else if (att.status === 'late') late++;
      else if (att.status === 'excused') excused++;
      else absent++;
    });

    const leaveStatusChart = [
      { name: 'Chờ duyệt', value: pendingLeaveRequests, color: '#F59E0B' },
      { name: 'Đã duyệt (Excused)', value: approvedLeaveRequests, color: '#10B981' },
      { name: 'Từ chối', value: rejectedLeaveRequests, color: '#EF4444' },
    ];

    const leaveTypeChart = [
      { name: 'Nghỉ ốm', value: allLeaveRequests.filter((r) => r.leaveType === 'sick').length, color: '#EF4444' },
      { name: 'Việc cá nhân', value: allLeaveRequests.filter((r) => r.leaveType === 'personal').length, color: '#F59E0B' },
      { name: 'Gia đình', value: allLeaveRequests.filter((r) => r.leaveType === 'family').length, color: '#8B5CF6' },
      { name: 'Khác', value: allLeaveRequests.filter((r) => r.leaveType === 'other').length, color: '#6B7280' },
    ];

    return {
      kpi: {
        totalStudents,
        totalTeachers,
        totalSubjects,
        totalCourseSections,
        totalSessions,
        totalAttendanceRecords,
        totalLeaveRequests: allLeaveRequests.length,
        pendingLeaveRequests,
        approvedLeaveRequests,
        rejectedLeaveRequests,
      },
      chart: [
        { name: 'Có mặt', value: present, color: '#10B981' },
        { name: 'Đi muộn', value: late, color: '#F59E0B' },
        { name: 'Vắng mặt', value: absent, color: '#EF4444' },
        { name: 'Có phép', value: excused, color: '#3B82F6' },
      ],
      leaveStatusChart,
      leaveTypeChart,
    };
  }
}
