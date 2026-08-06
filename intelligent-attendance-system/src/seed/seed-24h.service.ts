import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../modules/user/schemas/user.schema';
import { CourseSection, CourseSectionDocument } from '../modules/academic/course-section/schemas/course-section.schema';
import { ClassSession, ClassSessionDocument } from '../modules/academic/course-section/schemas/class-session.schema';
import { Enrollment, EnrollmentDocument } from '../modules/academic/student/schemas/enrollment.schema';
import { PeriodConfig, PeriodConfigDocument } from '../modules/config/schemas/period-config.schema';
import { AttendanceConfig, AttendanceConfigDocument } from '../modules/attendance/schemas/attendance-config.schema';
import { Subject, SubjectDocument } from '../modules/academic/subject/schemas/subject.schema';
import { Semester, SemesterDocument } from '../modules/academic/semester/schemas/semester.schema';
import { Attendance, AttendanceDocument } from '../modules/attendance/schemas/attendance.schema';

@Injectable()
export class Seed24hService {
  private readonly logger = new Logger(Seed24hService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(ClassSession.name) private classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(PeriodConfig.name) private periodConfigModel: Model<PeriodConfigDocument>,
    @InjectModel(AttendanceConfig.name) private attendanceConfigModel: Model<AttendanceConfigDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(Semester.name) private semesterModel: Model<SemesterDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  async runSeed24h() {
    this.logger.log('🚀 Đang khởi tạo dữ liệu tiết học 24H cho ngày HÔM NAY...');

    // 1. Cấu hình Period 1 bắt đầu 00:00 và Period 10 kết thúc 23:59
    await this.periodConfigModel.findOneAndUpdate(
      { periodNumber: 1 },
      { startTime: '00:00', endTime: '02:00', isActive: true },
      { upsert: true },
    );
    await this.periodConfigModel.findOneAndUpdate(
      { periodNumber: 10 },
      { startTime: '20:00', endTime: '23:59', isActive: true },
      { upsert: true },
    );

    // 2. Cấu hình AttendanceConfig rộng rãi cho Dev Test (bán kính 50,000m + chấp nhận IP local)
    await this.attendanceConfigModel.findOneAndUpdate(
      { isActive: true },
      {
        gracePeriodMinutes: 5, // Cho phép trễ tối đa 5 phút

        lateThresholdMinutes: 1440,
        allowSelfCheckIn: true,
        allowedPublicIps: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
        latitude: 21.028511,
        longitude: 105.804817,
        allowedRadiusMeters: 50000,
        requireWifiCheck: true,
        requireLocationCheck: true,
        isActive: true,
      },
      { upsert: true },
    );

    // 3. Tìm hoặc tạo Môn học & Học kỳ demo
    let subject = await this.subjectModel.findOne();
    if (!subject) {
      subject = await this.subjectModel.create({
        code: 'TEST24H',
        name: 'Môn Học Thử Nghiệm Point-Check 24/7',
        credits: 3,
      });
    }

    let semester = await this.semesterModel.findOne({ status: 'active' });
    if (!semester) {
      semester = await this.semesterModel.create({
        code: 'HK-24H',
        name: 'Học Kỳ Thử Nghiệm 24H',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000),
        status: 'active',
      });
    }

    // 4. Lớp học phần 24H
    let section = await this.courseSectionModel.findOne({ sectionCode: 'CS-24H-TEST' });
    if (!section) {
      section = await this.courseSectionModel.create({
        subjectId: subject._id,
        semesterId: semester._id,
        sectionCode: 'CS-24H-TEST',
        maxSize: 100,
        currentSize: 0,
        room: 'LAB-24H',
        schedule: 'Hàng ngày (00:00 - 23:59)',
        scheduleDayOfWeek: 2,
        scheduleStartPeriod: 1,
        scheduleNumPeriods: 10,
        status: 'open',
      });
    }

    // 5. CHỈ XÓA ĐIỂM DANH CỦA RIÊNG TIẾT HỌC TEST 24H NÀY (Giữ nguyên điểm danh các môn học khác)
    await this.attendanceModel.deleteMany({ courseSectionId: section._id });
    this.logger.log('🧹 Đã xóa lịch sử điểm danh riêng của tiết học test 24H!');

    // 6. Đăng ký tất cả sinh viên vào Lớp 24H này
    const students = await this.userModel.find();
    for (const student of students) {
      await this.enrollmentModel.findOneAndUpdate(
        {
          studentId: student._id,
          courseSectionId: section._id,
        },
        {
          enrollmentDate: new Date(),
          status: 'enrolled',
        },
        { upsert: true },
      );
    }

    // 7. Tạo Buổi học cho HÔM NAY phủ cả ngày
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const existingSession = await this.classSessionModel.findOne({
      courseSectionId: section._id,
      date: todayStart,
    });

    if (!existingSession) {
      await this.classSessionModel.create({
        courseSectionId: section._id,
        date: todayStart,
        startPeriod: 1,
        numPeriods: 10,
        room: 'ONLINE-24H',
        status: 'scheduled',
      });
    }

    this.logger.log('✅ ĐÃ CHỈ XÓA ĐIỂM DANH CỦA TIẾT TEST 24H THÀNH CÔNG!');
  }
}
