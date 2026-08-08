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
    this.logger.log('🚀 Đang khởi tạo dữ liệu tiết học 24H phủ kín từ 00:00 - 23:59 cho ngày HÔM NAY...');

    // 1. Khởi tạo 12 tiết học phủ trọn 24 giờ trong ngày (Mỗi tiết 2 tiếng)
    const periods24h = [
      { periodNumber: 1, name: 'Tiết 1 (00:00 - 02:00)', startTime: '00:00', endTime: '02:00' },
      { periodNumber: 2, name: 'Tiết 2 (02:00 - 04:00)', startTime: '02:00', endTime: '04:00' },
      { periodNumber: 3, name: 'Tiết 3 (04:00 - 06:00)', startTime: '04:00', endTime: '06:00' },
      { periodNumber: 4, name: 'Tiết 4 (06:00 - 08:00)', startTime: '06:00', endTime: '08:00' },
      { periodNumber: 5, name: 'Tiết 5 (08:00 - 10:00)', startTime: '08:00', endTime: '10:00' },
      { periodNumber: 6, name: 'Tiết 6 (10:00 - 12:00)', startTime: '10:00', endTime: '12:00' },
      { periodNumber: 7, name: 'Tiết 7 (12:00 - 14:00)', startTime: '12:00', endTime: '14:00' },
      { periodNumber: 8, name: 'Tiết 8 (14:00 - 16:00)', startTime: '14:00', endTime: '16:00' },
      { periodNumber: 9, name: 'Tiết 9 (16:00 - 18:00)', startTime: '16:00', endTime: '18:00' },
      { periodNumber: 10, name: 'Tiết 10 (18:00 - 20:00)', startTime: '18:00', endTime: '20:00' },
      { periodNumber: 11, name: 'Tiết 11 (20:00 - 22:00)', startTime: '20:00', endTime: '22:00' },
      { periodNumber: 12, name: 'Tiết 12 (22:00 - 23:59)', startTime: '22:00', endTime: '23:59' },
    ];

    for (const p of periods24h) {
      await this.periodConfigModel.findOneAndUpdate(
        { periodNumber: p.periodNumber },
        { name: p.name, startTime: p.startTime, endTime: p.endTime, isActive: true },
        { upsert: true },
      );
    }

    // 2. Cấu hình AttendanceConfig rộng rãi cho Dev Test (bán kính 50,000m + chấp nhận IP local)
    await this.attendanceConfigModel.findOneAndUpdate(
      { isActive: true },
      {
        gracePeriodMinutes: 15, // Cho phép điểm danh đúng giờ trong 15 phút đầu
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
        scheduleDayOfWeek: new Date().getDay() || 7,
        scheduleStartPeriod: 1,
        scheduleNumPeriods: 12,
        status: 'open',
      });
    } else {
      section.scheduleNumPeriods = 12;
      section.scheduleDayOfWeek = new Date().getDay() || 7;
      await section.save();
    }

    // 5. Xóa sạch dữ liệu điểm danh cũ của riêng tiết test 24H
    await this.attendanceModel.deleteMany({ courseSectionId: section._id });
    await this.classSessionModel.deleteMany({ courseSectionId: section._id });
    this.logger.log('🧹 Đã xóa lịch sử điểm danh & buổi học test cũ!');

    // 6. Đăng ký tất cả sinh viên vào Lớp 24H này (bỏ qua tài khoản Admin / Giảng viên)
    const students = await this.userModel.find({ roleCode: { $nin: ['admin', 'teacher', 'lecturer'] } });
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

    // 7. Tạo Buổi học phủ trọn 24h ngày HÔM NAY (Từ Tiết 1 đến Tiết 12)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // Buổi 1: Phủ từ Tiết 1 -> Tiết 12 (00:00 -> 23:59)
    await this.classSessionModel.create({
      courseSectionId: section._id,
      date: todayStart,
      startPeriod: 1,
      numPeriods: 12,
      room: 'ONLINE-24H',
      status: 'scheduled',
    });

    // Buổi 2: Tự động tính Tiết học KHỚP VỚI GIỜ HIỆN TẠI của máy tính bạn để test tính đúng giờ/đi muộn
    const currentHour = now.getHours();
    const currentPeriodNumber = Math.min(Math.floor(currentHour / 2) + 1, 12);

    this.logger.log(`⏰ Giờ hiện tại: ${currentHour}h ➔ Khớp vào Tiết ${currentPeriodNumber} (${periods24h[currentPeriodNumber - 1].startTime} - ${periods24h[currentPeriodNumber - 1].endTime})`);

    this.logger.log('✅ ĐÃ TẠO SEED 24H PHỦ 00:00 - 23:59 THÀNH CÔNG!');
  }

  /**
   * Tạo khung giờ học TÙY CHỈNH do người dùng truyền vào (VD: 02:15 đến 03:30)
   */
  async runSeedCustom(startTime: string, endTime: string) {
    this.logger.log(`🚀 Đang khởi tạo dữ liệu Tiết học TÙY CHỈNH (${startTime} - ${endTime}) cho ngày HÔM NAY...`);

    // 1. Tạo hoặc Cập nhật Tiết học Tùy chỉnh (Period 15)
    const customPeriodNumber = 15;
    await this.periodConfigModel.findOneAndUpdate(
      { periodNumber: customPeriodNumber },
      { name: `Tiết Tùy Chỉnh (${startTime} - ${endTime})`, startTime, endTime, isActive: true },
      { upsert: true },
    );

    // 2. Cấu hình AttendanceConfig rộng rãi cho Dev Test
    await this.attendanceConfigModel.findOneAndUpdate(
      { isActive: true },
      {
        gracePeriodMinutes: 15,
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
        code: 'TESTCUSTOM',
        name: 'Môn Học Tùy Chỉnh Thời Gian',
        credits: 3,
      });
    }

    let semester = await this.semesterModel.findOne({ status: 'active' });
    if (!semester) {
      semester = await this.semesterModel.create({
        code: 'HK-CUSTOM',
        name: 'Học Kỳ Tùy Chỉnh',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000),
        status: 'active',
      });
    }

    // 4. Lớp học phần Tùy chỉnh
    let section = await this.courseSectionModel.findOne({ sectionCode: 'CS-CUSTOM-TEST' });
    if (!section) {
      section = await this.courseSectionModel.create({
        subjectId: subject._id,
        semesterId: semester._id,
        sectionCode: 'CS-CUSTOM-TEST',
        maxSize: 100,
        currentSize: 0,
        room: 'ROOM-CUSTOM',
        schedule: `Tùy chỉnh (${startTime} - ${endTime})`,
        scheduleDayOfWeek: new Date().getDay() || 7,
        scheduleStartPeriod: customPeriodNumber,
        scheduleNumPeriods: 1,
        status: 'open',
      });
    } else {
      section.scheduleStartPeriod = customPeriodNumber;
      section.scheduleNumPeriods = 1;
      section.scheduleDayOfWeek = new Date().getDay() || 7;
      await section.save();
    }

    // 5. Xóa dữ liệu điểm danh cũ của Lớp tùy chỉnh
    await this.attendanceModel.deleteMany({ courseSectionId: section._id });
    await this.classSessionModel.deleteMany({ courseSectionId: section._id });

    // 6. Đăng ký tất cả sinh viên vào Lớp Tùy Chỉnh này (bỏ qua tài khoản Admin / Giảng viên)
    const students = await this.userModel.find({ roleCode: { $nin: ['admin', 'teacher', 'lecturer'] } });
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

    // 7. Tạo Buổi học cho HÔM NAY đúng khung giờ tùy chỉnh
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    await this.classSessionModel.create({
      courseSectionId: section._id,
      date: todayStart,
      startPeriod: customPeriodNumber,
      numPeriods: 1,
      room: 'ROOM-CUSTOM',
      status: 'scheduled',
    });

    this.logger.log(`✅ ĐÃ TẠO BUỔI HỌC TÙY CHỈNH KHIẾN HÔM NAY CÓ TIẾT (${startTime} - ${endTime}) THÀNH CÔNG!`);
  }
}
