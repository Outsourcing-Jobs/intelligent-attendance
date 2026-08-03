import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { ClassSubject, ClassSubjectDocument } from '../class/schemas/class-subject.schema';
import { CourseSection, CourseSectionDocument } from '../course-section/schemas/course-section.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(ClassSubject.name) private classSubjectModel: Model<ClassSubjectDocument>,
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
  ) {}

  async findAll() {
    return this.subjectModel
      .find()
      .populate('prerequisiteSubjectId', 'code name')
      .sort({ code: 1 })
      .lean();
  }

  async findById(id: string) {
    const subject = await this.subjectModel
      .findById(id)
      .populate('prerequisiteSubjectId', 'code name')
      .lean();
    if (!subject) {
      throw new NotFoundException('Môn học không tồn tại');
    }
    return subject;
  }

  async create(dto: CreateSubjectDto) {
    const existing = await this.subjectModel.findOne({ code: dto.code });
    if (existing) {
      throw new BadRequestException('Mã môn học đã tồn tại');
    }

    if (dto.prerequisiteSubjectId) {
      const prereq = await this.subjectModel.findById(dto.prerequisiteSubjectId);
      if (!prereq) {
        throw new NotFoundException('Môn tiên quyết không tồn tại');
      }
    }

    return this.subjectModel.create(dto);
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const current = await this.subjectModel.findById(id).lean();
    if (!current) {
      throw new NotFoundException('Môn học không tồn tại');
    }

    // Check unique code if code is being changed
    if (dto.code && dto.code !== current.code) {
      const existing = await this.subjectModel.findOne({ code: dto.code, _id: { $ne: id } });
      if (existing) {
        throw new BadRequestException('Mã môn học đã tồn tại');
      }
    }

    // Check circular prerequisite if prerequisite is being changed
    if (dto.prerequisiteSubjectId) {
      if (dto.prerequisiteSubjectId === id) {
        throw new BadRequestException('Môn học không thể là tiên quyết của chính nó');
      }

      const prereq = await this.subjectModel.findById(dto.prerequisiteSubjectId);
      if (!prereq) {
        throw new NotFoundException('Môn tiên quyết không tồn tại');
      }

      await this.checkCircularPrerequisite(id, dto.prerequisiteSubjectId);
    }

    const subject = await this.subjectModel.findByIdAndUpdate(id, dto, { new: true });
    if (!subject) {
      throw new NotFoundException('Môn học không tồn tại');
    }
    return subject;
  }

  async remove(id: string) {
    // Check if any other subject uses this as a prerequisite
    const isPrerequisite = await this.subjectModel.exists({ prerequisiteSubjectId: id });
    if (isPrerequisite) {
      throw new BadRequestException('Không thể xóa môn học đang được dùng làm tiên quyết cho môn khác');
    }

    // Check if any ClassSubject references this
    const inClassSubject = await this.classSubjectModel.exists({ subjectId: id });
    if (inClassSubject) {
      throw new BadRequestException('Không thể xóa môn học đang được gán cho lớp');
    }

    // Check if any CourseSection references this
    const inCourseSection = await this.courseSectionModel.exists({ subjectId: id });
    if (inCourseSection) {
      throw new BadRequestException('Không thể xóa môn học đang có lớp học phần');
    }

    const subject = await this.subjectModel.findByIdAndDelete(id);
    if (!subject) {
      throw new NotFoundException('Môn học không tồn tại');
    }
    return { message: 'Đã xóa môn học thành công' };
  }

  /**
   * Walk the prerequisite chain to detect cycles.
   * If we reach `targetId` while walking from `prereqId`, it's a cycle.
   * Max depth of 50 to guard against corrupted data.
   */
  private async checkCircularPrerequisite(targetId: string, prereqId: string) {
    let currentId: string | null = prereqId;
    const visited = new Set<string>();
    let depth = 0;
    const MAX_DEPTH = 50;

    while (currentId && depth < MAX_DEPTH) {
      if (currentId === targetId) {
        throw new BadRequestException(
          'Phát hiện vòng lặp tiên quyết: môn tiên quyết (trực tiếp hoặc gián tiếp) trỏ ngược về môn hiện tại',
        );
      }

      if (visited.has(currentId)) {
        // Found a cycle in the existing data (not involving targetId) — stop walking
        break;
      }

      visited.add(currentId);
      const subject = await this.subjectModel
        .findById(currentId)
        .select('prerequisiteSubjectId')
        .lean();

      currentId = subject?.prerequisiteSubjectId
        ? subject.prerequisiteSubjectId.toString()
        : null;
      depth++;
    }
  }
}
