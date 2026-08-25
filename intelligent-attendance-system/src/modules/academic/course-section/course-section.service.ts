import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourseSection, CourseSectionDocument } from './schemas/course-section.schema';
import { CourseSectionLecturer, CourseSectionLecturerDocument } from './schemas/course-section-lecturer.schema';
import { ClassSession, ClassSessionDocument } from './schemas/class-session.schema';
import { Subject, SubjectDocument } from '../subject/schemas/subject.schema';
import { Semester, SemesterDocument } from '../semester/schemas/semester.schema';
import { Enrollment, EnrollmentDocument } from '../student/schemas/enrollment.schema';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';

import { UserService } from '../../user/user.service';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class CourseSectionService {
  constructor(
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(CourseSectionLecturer.name) private courseSectionLecturerModel: Model<CourseSectionLecturerDocument>,
    @InjectModel(ClassSession.name) private classSessionModel: Model<ClassSessionDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(Semester.name) private semesterModel: Model<SemesterDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  async getLecturersList(): Promise<any[]> {
    return this.userService.findLecturers();
  }

  async findAll(semesterId?: string, subjectId?: string, currentUser?: any): Promise<any[]> {
    const roleCode = currentUser?.roleId?.code || currentUser?.roleCode || '';
    const filter: any = {};

    if (semesterId) filter.semesterId = semesterId;
    if (subjectId) filter.subjectId = subjectId;

    let enrolledIdsSet = new Set<string>();

    // Role-based data scoping
    if (roleCode === 'teacher' || roleCode === 'lecturer') {
      const assignments = await this.courseSectionLecturerModel
        .find({
          $or: [
            { lecturerId: new Types.ObjectId(currentUser._id) },
            { lecturerId: String(currentUser._id) },
          ],
        })
        .select('courseSectionId')
        .lean();
      const assignedIds = assignments.map((a) => a.courseSectionId);
      filter._id = { $in: assignedIds };
    } else if (roleCode === 'student') {
      const enrollments = await this.enrollmentModel
        .find({ studentId: currentUser._id })
        .select('courseSectionId')
        .lean();
      const enrolledIds = enrollments.map((e) => String(e.courseSectionId));
      enrolledIdsSet = new Set(enrolledIds);
    }

    const sections = await this.courseSectionModel
      .find(filter)
      .populate('subjectId', 'code name credits')
      .populate('semesterId', 'name startDate endDate status')
      .sort({ sectionCode: 1 })
      .lean();

    // Populate assigned lecturers for each section (supports both ObjectId and String stored IDs)
    const sectionObjectIds = sections.map((s) => new Types.ObjectId(s._id));
    const sectionStringIds = sections.map((s) => String(s._id));

    const lecturers = await this.courseSectionLecturerModel
      .find({
        $or: [
          { courseSectionId: { $in: sectionObjectIds } },
          { courseSectionId: { $in: sectionStringIds } },
        ],
      })
      .populate('lecturerId', 'fullName userCode email phone')
      .lean();

    const lecturerMap = new Map<string, any[]>();
    for (const l of lecturers) {
      const csId = String(l.courseSectionId || '');
      if (!lecturerMap.has(csId)) {
        lecturerMap.set(csId, []);
      }
      lecturerMap.get(csId)!.push({
        _id: l._id,
        role: l.role,
        lecturer: l.lecturerId,
      });
    }

    return sections.map((s) => ({
      ...s,
      lecturers: lecturerMap.get(String(s._id)) || [],
      isEnrolled: roleCode === 'student' ? enrolledIdsSet.has(String(s._id)) : undefined,
    }));
  }

  async findById(id: string): Promise<any> {
    const courseSection = await this.courseSectionModel
      .findById(id)
      .populate('subjectId', 'code name credits')
      .populate('semesterId', 'name startDate endDate status')
      .lean();
    if (!courseSection) {
      throw new NotFoundException('Lớp học phần không tồn tại');
    }

    const lecturers = await this.getLecturers(id);

    return {
      ...courseSection,
      lecturers,
    };
  }

  async create(dto: CreateCourseSectionDto) {
    const subject = await this.subjectModel.findById(dto.subjectId);
    if (!subject) {
      throw new NotFoundException('Môn học không tồn tại');
    }

    const semester = await this.semesterModel.findById(dto.semesterId);
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại');
    }

    if (!['active', 'upcoming'].includes(semester.status)) {
      throw new BadRequestException(
        `Chỉ có thể tạo lớp học phần khi học kỳ ở trạng thái "active" hoặc "upcoming" (hiện tại: "${semester.status}")`,
      );
    }

    if (dto.scheduleDayOfWeek && dto.scheduleStartPeriod && dto.scheduleNumPeriods && dto.room) {
      await this.checkScheduleConflict(
        null,
        dto.semesterId,
        dto.scheduleDayOfWeek,
        dto.scheduleStartPeriod,
        dto.scheduleNumPeriods,
        dto.room,
        undefined,
      );
    }

    const courseSection = await this.courseSectionModel.create({ ...dto, currentSize: 0 });

    if (dto.scheduleDayOfWeek && dto.scheduleStartPeriod && dto.scheduleNumPeriods && dto.room) {
      await this.generateSessionsForSection(courseSection._id.toString());
    }

    return courseSection;
  }

  async update(id: string, dto: UpdateCourseSectionDto) {
    const current = await this.courseSectionModel.findById(id).lean();
    if (!current) {
      throw new NotFoundException('Lớp học phần không tồn tại');
    }

    if (dto.subjectId) {
      const subject = await this.subjectModel.findById(dto.subjectId);
      if (!subject) {
        throw new NotFoundException('Môn học không tồn tại');
      }
    }

    if (dto.semesterId) {
      const semester = await this.semesterModel.findById(dto.semesterId);
      if (!semester) {
        throw new NotFoundException('Học kỳ không tồn tại');
      }
      if (!['active', 'upcoming'].includes(semester.status)) {
        throw new BadRequestException(
          `Chỉ có thể chuyển sang học kỳ ở trạng thái "active" hoặc "upcoming" (hiện tại: "${semester.status}")`,
        );
      }
    }

    if (dto.maxSize !== undefined && dto.maxSize < current.currentSize) {
      throw new BadRequestException(
        `Sĩ số tối đa (${dto.maxSize}) không thể nhỏ hơn sĩ số hiện tại (${current.currentSize})`,
      );
    }

    const scheduleChanged =
      dto.scheduleDayOfWeek !== undefined ||
      dto.scheduleStartPeriod !== undefined ||
      dto.scheduleNumPeriods !== undefined ||
      dto.room !== undefined;

    if (scheduleChanged) {
      const finalDay = dto.scheduleDayOfWeek !== undefined ? dto.scheduleDayOfWeek : current.scheduleDayOfWeek;
      const finalStart = dto.scheduleStartPeriod !== undefined ? dto.scheduleStartPeriod : current.scheduleStartPeriod;
      const finalNum = dto.scheduleNumPeriods !== undefined ? dto.scheduleNumPeriods : current.scheduleNumPeriods;
      const finalRoom = dto.room !== undefined ? dto.room : current.room;

      if (finalDay && finalStart && finalNum && finalRoom) {
        const mainAssignment = await this.courseSectionLecturerModel.findOne({
          courseSectionId: id,
          role: 'main',
        }).lean();
        const mainLecturerId = mainAssignment?.lecturerId?.toString();

        await this.checkScheduleConflict(
          id,
          dto.semesterId || current.semesterId.toString(),
          finalDay,
          finalStart,
          finalNum,
          finalRoom,
          mainLecturerId,
        );
      }
    }

    const courseSection = await this.courseSectionModel.findByIdAndUpdate(id, dto, { new: true });
    if (!courseSection) {
      throw new NotFoundException('Lớp học phần không tồn tại');
    }

    if (scheduleChanged) {
      if (
        courseSection.scheduleDayOfWeek &&
        courseSection.scheduleStartPeriod &&
        courseSection.scheduleNumPeriods &&
        courseSection.room
      ) {
        await this.generateSessionsForSection(id);
      } else {
        await this.classSessionModel.deleteMany({
          $or: [{ courseSectionId: new Types.ObjectId(id) }, { courseSectionId: id }],
        });
      }
    }

    return courseSection;
  }

  async remove(id: string) {
    const hasEnrollments = await this.enrollmentModel.exists({ courseSectionId: id });
    if (hasEnrollments) {
      throw new BadRequestException(
        'Không thể xóa lớp học phần đang có sinh viên đăng ký. Hãy hủy đăng ký trước',
      );
    }

    const csObjId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
    await this.courseSectionLecturerModel.deleteMany({
      $or: [{ courseSectionId: csObjId }, { courseSectionId: id }],
    });

    await this.classSessionModel.deleteMany({
      $or: [{ courseSectionId: csObjId }, { courseSectionId: id }],
    });

    const courseSection = await this.courseSectionModel.findByIdAndDelete(id);
    if (!courseSection) {
      throw new NotFoundException('Lớp học phần không tồn tại');
    }
    return { message: 'Đã xóa lớp học phần thành công' };
  }

  // --- Lecturer assignment for CourseSection ---

  async getLecturers(courseSectionId: string): Promise<any[]> {
    const section = await this.courseSectionModel.findById(courseSectionId);
    if (!section) {
      throw new NotFoundException('Lớp học phần không tồn tại');
    }

    const csObjId = Types.ObjectId.isValid(courseSectionId) ? new Types.ObjectId(courseSectionId) : courseSectionId;

    return this.courseSectionLecturerModel
      .find({
        $or: [{ courseSectionId: csObjId }, { courseSectionId: String(courseSectionId) }],
      })
      .populate('lecturerId', 'fullName userCode email phone')
      .lean();
  }

  async assignLecturer(courseSectionId: string, lecturerId: string, role = 'main'): Promise<any> {
    const section = await this.courseSectionModel.findById(courseSectionId);
    if (!section) {
      throw new NotFoundException('Lớp học phần không tồn tại');
    }

    const csObjId = Types.ObjectId.isValid(courseSectionId) ? new Types.ObjectId(courseSectionId) : courseSectionId;
    const lecObjId = Types.ObjectId.isValid(lecturerId) ? new Types.ObjectId(lecturerId) : lecturerId;

    const existing = await this.courseSectionLecturerModel.findOne({
      $or: [
        { courseSectionId: csObjId, lecturerId: lecObjId },
        { courseSectionId: String(courseSectionId), lecturerId: String(lecturerId) },
      ],
    });
    if (existing) {
      throw new BadRequestException('Giảng viên đã được phân công cho lớp học phần này');
    }

    if (role === 'main') {
      if (
        section.scheduleDayOfWeek &&
        section.scheduleStartPeriod &&
        section.scheduleNumPeriods &&
        section.room
      ) {
        await this.checkScheduleConflict(
          section._id.toString(),
          section.semesterId.toString(),
          section.scheduleDayOfWeek,
          section.scheduleStartPeriod,
          section.scheduleNumPeriods,
          section.room,
          lecturerId,
        );
      }
    }

    const assignment = await this.courseSectionLecturerModel.create({
      courseSectionId: csObjId,
      lecturerId: lecObjId,
      role,
    });

    if (role === 'main') {
      await this.classSessionModel.updateMany(
        { courseSectionId: csObjId, status: 'scheduled' },
        { lecturerId: lecObjId },
      );
    }

    return assignment;
  }

  async removeLecturer(courseSectionId: string, lecturerId: string): Promise<any> {
    const csObjId = Types.ObjectId.isValid(courseSectionId) ? new Types.ObjectId(courseSectionId) : courseSectionId;
    const lecObjId = Types.ObjectId.isValid(lecturerId) ? new Types.ObjectId(lecturerId) : lecturerId;

    const result = await this.courseSectionLecturerModel.findOneAndDelete({
      $or: [
        { courseSectionId: csObjId, lecturerId: lecObjId },
        { courseSectionId: String(courseSectionId), lecturerId: String(lecturerId) },
      ],
    });
    if (!result) {
      throw new NotFoundException('Không tìm thấy liên kết phân công giảng viên');
    }

    if (result.role === 'main') {
      await this.classSessionModel.updateMany(
        { courseSectionId: csObjId, lecturerId: lecObjId, status: 'scheduled' },
        { $unset: { lecturerId: 1 } },
      );
    }

    return { message: 'Đã gỡ giảng viên khỏi lớp học phần' };
  }

  async getStudents(courseSectionId: string): Promise<any[]> {
    const section = await this.courseSectionModel.findById(courseSectionId);
    if (!section) {
      throw new NotFoundException('Lớp học phần không tồn tại');
    }

    const csObjId = Types.ObjectId.isValid(courseSectionId) ? new Types.ObjectId(courseSectionId) : courseSectionId;

    return this.enrollmentModel
      .find({
        $or: [{ courseSectionId: csObjId }, { courseSectionId: String(courseSectionId) }],
      })
      .populate('studentId', 'fullName userCode email phone avatarUrl status')
      .sort({ createdAt: 1 })
      .lean();
  }

  async checkScheduleConflict(
    excludeId: string | null,
    semesterId: string,
    dayOfWeek: number,
    startPeriod: number,
    numPeriods: number,
    room: string,
    lecturerId?: string,
  ): Promise<void> {
    const query: any = {
      semesterId: new Types.ObjectId(semesterId),
      scheduleDayOfWeek: dayOfWeek,
    };
    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const siblingSections = await this.courseSectionModel.find(query).lean();

    const start1 = startPeriod;
    const end1 = startPeriod + numPeriods - 1;

    for (const section of siblingSections) {
      if (!section.scheduleStartPeriod || !section.scheduleNumPeriods) {
        continue;
      }

      const start2 = section.scheduleStartPeriod;
      const end2 = section.scheduleStartPeriod + section.scheduleNumPeriods - 1;

      const hasOverlap = start1 <= end2 && start2 <= end1;

      if (hasOverlap) {
        if (section.room && section.room.toLowerCase().trim() === room.toLowerCase().trim()) {
          throw new BadRequestException(
            `Trùng lịch: Phòng ${room} đã được xếp cho lớp ${section.sectionCode} vào Thứ ${dayOfWeek}, Tiết ${section.scheduleStartPeriod}-${end2}`,
          );
        }

        if (lecturerId) {
          const hasLecturer = await this.courseSectionLecturerModel.exists({
            courseSectionId: section._id,
            lecturerId: new Types.ObjectId(lecturerId),
            role: 'main',
          });
          if (hasLecturer) {
            throw new BadRequestException(
              `Trùng lịch: Giảng viên đã có lịch dạy lớp ${section.sectionCode} vào Thứ ${dayOfWeek}, Tiết ${section.scheduleStartPeriod}-${end2}`,
            );
          }
        }
      }
    }
  }

  async generateSessionsForSection(courseSectionId: string): Promise<void> {
    const courseSection = await this.courseSectionModel
      .findById(courseSectionId)
      .populate('semesterId')
      .lean();
    if (!courseSection) {
      throw new NotFoundException('Lớp học phần không tồn tại');
    }

    const { scheduleDayOfWeek, scheduleStartPeriod, scheduleNumPeriods, room, semesterId } = courseSection;
    if (!scheduleDayOfWeek || !scheduleStartPeriod || !scheduleNumPeriods || !room) {
      return;
    }

    const semester = semesterId as any;
    if (!semester || !semester.startDate || !semester.endDate) {
      throw new BadRequestException('Học kỳ không cấu hình ngày bắt đầu/kết thúc');
    }

    // Find main lecturer
    const mainAssignment = await this.courseSectionLecturerModel
      .findOne({ courseSectionId, role: 'main' })
      .lean();
    const defaultLecturerId = mainAssignment?.lecturerId || null;

    // Delete existing scheduled sessions
    await this.classSessionModel.deleteMany({
      $or: [
        { courseSectionId: new Types.ObjectId(courseSectionId) },
        { courseSectionId: String(courseSectionId) },
      ],
      status: 'scheduled',
    });

    // Calculate dates matching dayOfWeek
    const dates = this.getDatesForDayOfWeek(
      semester.startDate,
      semester.endDate,
      scheduleDayOfWeek,
    );

    const sessionsToCreate = dates.map((date) => ({
      courseSectionId: new Types.ObjectId(courseSectionId),
      lecturerId: defaultLecturerId,
      date,
      startPeriod: scheduleStartPeriod,
      numPeriods: scheduleNumPeriods,
      room,
      status: 'scheduled',
    }));

    if (sessionsToCreate.length > 0) {
      await this.classSessionModel.insertMany(sessionsToCreate);
    }
  }

  private getDatesForDayOfWeek(startDate: Date, endDate: Date, dayOfWeek: number): Date[] {
    const dates: Date[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    const firstMonday = new Date(start.setDate(diff));
    firstMonday.setHours(0, 0, 0, 0);

    let currentMonday = new Date(firstMonday);

    while (currentMonday <= end) {
      const jsDay = dayOfWeek === 8 ? 0 : dayOfWeek - 1;
      const sessionDate = new Date(currentMonday);
      sessionDate.setDate(currentMonday.getDate() + (jsDay === 0 ? 6 : jsDay - 1));
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate >= startDate && sessionDate <= endDate) {
        dates.push(sessionDate);
      }

      currentMonday.setDate(currentMonday.getDate() + 7);
    }

    return dates;
  }

  async getSessions(courseSectionId: string): Promise<any[]> {
    const section = await this.courseSectionModel.findById(courseSectionId);
    if (!section) {
      throw new NotFoundException('Lớp học phần không tồn tại');
    }

    return this.classSessionModel
      .find({ courseSectionId })
      .populate('lecturerId', 'fullName userCode email phone')
      .sort({ date: 1 })
      .lean();
  }

  async updateSession(courseSectionId: string, sessionId: string, updateDto: any): Promise<any> {
    const session = await this.classSessionModel.findOne({
      _id: Types.ObjectId.isValid(sessionId) ? new Types.ObjectId(sessionId) : sessionId,
      courseSectionId: Types.ObjectId.isValid(courseSectionId) ? new Types.ObjectId(courseSectionId) : courseSectionId,
    });
    if (!session) {
      throw new NotFoundException('Buổi học không tồn tại trong lớp học phần này');
    }

    if (updateDto.lecturerId) {
      const lecObjId = Types.ObjectId.isValid(updateDto.lecturerId)
        ? new Types.ObjectId(updateDto.lecturerId)
        : updateDto.lecturerId;
      session.lecturerId = lecObjId as any;
    } else if (updateDto.lecturerId === null) {
      session.lecturerId = null as any;
    }

    if (updateDto.room !== undefined) {
      session.room = updateDto.room;
    }

    if (updateDto.status !== undefined) {
      if (!['scheduled', 'completed', 'cancelled'].includes(updateDto.status)) {
        throw new BadRequestException('Trạng thái buổi học không hợp lệ');
      }
      session.status = updateDto.status;
    }

    if (updateDto.date !== undefined) {
      session.date = new Date(updateDto.date);
    }

    if (updateDto.startPeriod !== undefined) {
      session.startPeriod = updateDto.startPeriod;
    }

    if (updateDto.numPeriods !== undefined) {
      session.numPeriods = updateDto.numPeriods;
    }

    if (updateDto.allowedPublicIps !== undefined) session.allowedPublicIps = updateDto.allowedPublicIps;
    if (updateDto.latitude !== undefined) session.latitude = updateDto.latitude;
    if (updateDto.longitude !== undefined) session.longitude = updateDto.longitude;
    if (updateDto.allowedRadiusMeters !== undefined) session.allowedRadiusMeters = updateDto.allowedRadiusMeters;
    if (updateDto.requireWifiCheck !== undefined) session.requireWifiCheck = updateDto.requireWifiCheck;
    if (updateDto.requireLocationCheck !== undefined) session.requireLocationCheck = updateDto.requireLocationCheck;

    await session.save();
    return session;
  }


  async createSession(courseSectionId: string, dto: any) {
    const courseSection = await this.courseSectionModel.findById(courseSectionId);
    if (!courseSection) {
      throw new NotFoundException('Không tìm thấy lớp học phần');
    }

    const sessionDate = new Date(dto.date);
    let lecturerId = dto.lecturerId ? new Types.ObjectId(dto.lecturerId) : undefined;
    if (!lecturerId) {
      const mainAssignment = await this.courseSectionLecturerModel.findOne({
        courseSectionId: new Types.ObjectId(courseSectionId),
        role: 'main',
      });
      if (mainAssignment) {
        lecturerId = mainAssignment.lecturerId as any;
      }
    }

    const session = await this.classSessionModel.create({
      courseSectionId: new Types.ObjectId(courseSectionId),
      date: sessionDate,
      startPeriod: dto.startPeriod,
      numPeriods: dto.numPeriods,
      room: dto.room || courseSection.room || 'A101',
      lecturerId: lecturerId || null,
      status: dto.status || 'scheduled',
      allowedPublicIps: dto.allowedPublicIps || null,
      latitude: dto.latitude != null ? dto.latitude : null,
      longitude: dto.longitude != null ? dto.longitude : null,
      allowedRadiusMeters: dto.allowedRadiusMeters != null ? dto.allowedRadiusMeters : null,
      requireWifiCheck: dto.requireWifiCheck != null ? dto.requireWifiCheck : null,
      requireLocationCheck: dto.requireLocationCheck != null ? dto.requireLocationCheck : null,
    });

    // 🔔 Gửi thông báo tới tất cả sinh viên thuộc Lớp Học Phần này
    try {
      const enrollments = await this.enrollmentModel
        .find({ courseSectionId: new Types.ObjectId(courseSectionId), status: 'enrolled' })
        .select('studentId')
        .lean();
      const studentIds = enrollments.map((e) => e.studentId.toString());

      if (studentIds.length > 0) {
        const subject = await this.subjectModel.findById(courseSection.subjectId).lean();
        const courseName = subject ? (subject as any).name || subject.code : courseSection.sectionCode;
        const dateStr = sessionDate.toLocaleDateString('vi-VN');

        await this.notificationService.send({
          recipientIds: studentIds,
          templateCode: 'session.created',
          variables: {
            courseName,
            date: dateStr,
            time: `Tiết ${dto.startPeriod}`,
          },
          eventType: 'session.created',
        });
      }
    } catch (err: any) {
      console.warn(`Failed to send session.created notification: ${err?.message}`);
    }

    return session;
  }


  async deleteSession(courseSectionId: string, sessionId: string) {
    const deleted = await this.classSessionModel.findOneAndDelete({
      _id: new Types.ObjectId(sessionId),
      courseSectionId: new Types.ObjectId(courseSectionId),
    });
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }
    return { message: 'Xóa buổi học thành công' };
  }


  async getMySessions(currentUser: any): Promise<any[]> {

    const roleCode = currentUser?.roleId?.code || currentUser?.roleCode || '';
    console.log('[DEBUG getMySessions] User ID:', currentUser?._id, 'Role Code:', roleCode);
    const filter: any = {};

    if (roleCode === "student") {
      const enrollments = await this.enrollmentModel
        .find({ studentId: currentUser._id })
        .select("courseSectionId")
        .lean();
      const enrolledIds = enrollments.map((e) => e.courseSectionId);
      const enrolledObjectIds = enrolledIds.map((id) => new Types.ObjectId(id));
      const enrolledStringIds = enrolledIds.map((id) => String(id));
      filter.courseSectionId = {
        $in: [...enrolledObjectIds, ...enrolledStringIds],
      };
    } else if (roleCode === "teacher" || roleCode === "lecturer") {
      const assignments = await this.courseSectionLecturerModel
        .find({
          $or: [
            { lecturerId: new Types.ObjectId(currentUser._id) },
            { lecturerId: String(currentUser._id) },
          ],
        })
        .select("courseSectionId")
        .lean();
      const assignedIds = assignments.map((a) => a.courseSectionId);
      const assignedObjectIds = assignedIds.map((id) => new Types.ObjectId(id));
      const assignedStringIds = assignedIds.map((id) => String(id));

      const userIdObj = new Types.ObjectId(currentUser._id);
      const userIdStr = String(currentUser._id);

      filter.$or = [
        { courseSectionId: { $in: [...assignedObjectIds, ...assignedStringIds] } },
        { lecturerId: userIdObj },
        { lecturerId: userIdStr },
      ];
    } else if (roleCode !== "admin") {
      return [];
    }

    return this.classSessionModel
      .find(filter)
      .populate({
        path: 'courseSectionId',
        populate: {
          path: 'subjectId',
          select: 'code name credits',
        },
      })
      .populate('lecturerId', 'fullName userCode email')
      .sort({ date: 1 })
      .lean();
  }

  async enroll(courseSectionId: string, studentId: string): Promise<any> {
    const courseSection = await this.courseSectionModel.findById(courseSectionId);
    if (!courseSection) {
      throw new NotFoundException('Không tìm thấy lớp học phần');
    }

    if (courseSection.status !== 'open') {
      throw new BadRequestException('Lớp học phần hiện đã đóng đăng ký hoặc bị hủy');
    }

    if (courseSection.currentSize >= courseSection.maxSize) {
      throw new BadRequestException('Lớp học phần đã đạt sĩ số tối đa');
    }

    const csObjId = new Types.ObjectId(courseSectionId);
    const stObjId = new Types.ObjectId(studentId);

    const exists = await this.enrollmentModel.exists({
      studentId: stObjId,
      courseSectionId: csObjId,
    });
    if (exists) {
      throw new BadRequestException('Bạn đã đăng ký lớp học phần này rồi');
    }

    await this.enrollmentModel.create({
      studentId: stObjId,
      courseSectionId: csObjId,
      enrollmentDate: new Date(),
    });

    courseSection.currentSize = (courseSection.currentSize || 0) + 1;
    await courseSection.save();

    return { message: 'Đăng ký học phần thành công', currentSize: courseSection.currentSize };
  }

  async withdraw(courseSectionId: string, studentId: string): Promise<any> {
    const csObjId = new Types.ObjectId(courseSectionId);
    const stObjId = new Types.ObjectId(studentId);

    const enrollment = await this.enrollmentModel.findOneAndDelete({
      studentId: stObjId,
      courseSectionId: csObjId,
    });

    if (!enrollment) {
      throw new BadRequestException('Bạn chưa đăng ký lớp học phần này');
    }

    const courseSection = await this.courseSectionModel.findById(courseSectionId);
    if (courseSection) {
      courseSection.currentSize = Math.max(0, (courseSection.currentSize || 0) - 1);
      await courseSection.save();
    }

    return { message: 'Hủy đăng ký học phần thành công' };
  }
}
