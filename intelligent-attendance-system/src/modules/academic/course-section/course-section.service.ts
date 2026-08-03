import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourseSection, CourseSectionDocument } from './schemas/course-section.schema';
import { CourseSectionLecturer, CourseSectionLecturerDocument } from './schemas/course-section-lecturer.schema';
import { Subject, SubjectDocument } from '../subject/schemas/subject.schema';
import { Semester, SemesterDocument } from '../semester/schemas/semester.schema';
import { Enrollment, EnrollmentDocument } from '../student/schemas/enrollment.schema';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';

import { UserService } from '../../user/user.service';

@Injectable()
export class CourseSectionService {
  constructor(
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
    @InjectModel(CourseSectionLecturer.name) private courseSectionLecturerModel: Model<CourseSectionLecturerDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(Semester.name) private semesterModel: Model<SemesterDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    private readonly userService: UserService,
  ) {}

  async getLecturersList(): Promise<any[]> {
    return this.userService.findLecturers();
  }

  async findAll(semesterId?: string, subjectId?: string, currentUser?: any): Promise<any[]> {
    const roleCode = currentUser?.roleId?.code || currentUser?.roleCode || '';
    const filter: any = {};

    if (semesterId) filter.semesterId = semesterId;
    if (subjectId) filter.subjectId = subjectId;

    // Role-based data scoping
    if (roleCode === 'teacher') {
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
      const enrolledIds = enrollments.map((e) => e.courseSectionId);
      filter._id = { $in: enrolledIds };
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

    return this.courseSectionModel.create({ ...dto, currentSize: 0 });
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

    const courseSection = await this.courseSectionModel.findByIdAndUpdate(id, dto, { new: true });
    if (!courseSection) {
      throw new NotFoundException('Lớp học phần không tồn tại');
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

    return this.courseSectionLecturerModel.create({
      courseSectionId: csObjId,
      lecturerId: lecObjId,
      role,
    });
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
}
