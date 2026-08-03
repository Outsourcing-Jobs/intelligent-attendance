import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudentClass, ClassDocument } from './schemas/class.schema';
import { ClassSubject, ClassSubjectDocument } from './schemas/class-subject.schema';
import { Subject, SubjectDocument } from '../subject/schemas/subject.schema';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(StudentClass.name) private classModel: Model<ClassDocument>,
    @InjectModel(ClassSubject.name) private classSubjectModel: Model<ClassSubjectDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(currentUser?: any) {
    const roleCode = currentUser?.roleId?.code || currentUser?.roleCode || '';
    const filter: any = {};

    // Role-based data scoping
    if (roleCode === 'teacher' || roleCode === 'lecturer') {
      filter.homeroomLecturerId = currentUser._id;
    } else if (roleCode === 'student') {
      if (currentUser?.classId) {
        filter._id = currentUser.classId;
      } else {
        // Student without a class assigned sees no cohort classes
        return [];
      }
    }

    return this.classModel
      .find(filter)
      .populate('homeroomLecturerId', 'fullName userCode email phone')
      .sort({ cohortYear: -1, name: 1 })
      .lean();
  }

  async findById(id: string) {
    const studentClass = await this.classModel
      .findById(id)
      .populate('homeroomLecturerId', 'fullName userCode email phone')
      .lean();
    if (!studentClass) {
      throw new NotFoundException('Lớp không tồn tại');
    }
    return studentClass;
  }

  async create(dto: CreateClassDto) {
    return this.classModel.create(dto);
  }

  async update(id: string, dto: UpdateClassDto) {
    const studentClass = await this.classModel.findByIdAndUpdate(id, dto, { new: true });
    if (!studentClass) {
      throw new NotFoundException('Lớp không tồn tại');
    }
    return studentClass;
  }

  async remove(id: string) {
    // Check if any student user belongs to this class
    const hasStudents = await this.userModel.exists({ classId: id });
    if (hasStudents) {
      throw new BadRequestException('Không thể xóa lớp đang có sinh viên');
    }

    // Remove all ClassSubject associations
    await this.classSubjectModel.deleteMany({ classId: id });

    const studentClass = await this.classModel.findByIdAndDelete(id);
    if (!studentClass) {
      throw new NotFoundException('Lớp không tồn tại');
    }
    return { message: 'Đã xóa lớp thành công' };
  }

  async getStudents(classId: string): Promise<any[]> {
    const studentClass = await this.classModel.findById(classId);
    if (!studentClass) {
      throw new NotFoundException('Lớp không tồn tại');
    }

    const classObjId = Types.ObjectId.isValid(classId) ? new Types.ObjectId(classId) : classId;
    return this.userModel
      .find({
        $or: [{ classId: classObjId }, { classId: String(classId) }],
      })
      .select('_id fullName userCode email phone avatarUrl status')
      .sort({ userCode: 1, fullName: 1 })
      .lean();
  }

  // --- ClassSubject management ---

  async getSubjects(classId: string) {
    const studentClass = await this.classModel.findById(classId);
    if (!studentClass) {
      throw new NotFoundException('Lớp không tồn tại');
    }

    return this.classSubjectModel
      .find({ classId })
      .populate('subjectId', 'code name credits')
      .lean();
  }

  async assignSubject(classId: string, subjectId: string) {
    const studentClass = await this.classModel.findById(classId);
    if (!studentClass) {
      throw new NotFoundException('Lớp không tồn tại');
    }

    const subject = await this.subjectModel.findById(subjectId);
    if (!subject) {
      throw new NotFoundException('Môn học không tồn tại');
    }

    const existing = await this.classSubjectModel.findOne({ classId, subjectId });
    if (existing) {
      throw new BadRequestException('Môn học đã được gán cho lớp này');
    }

    return this.classSubjectModel.create({ classId, subjectId });
  }

  async removeSubject(classId: string, subjectId: string) {
    const result = await this.classSubjectModel.findOneAndDelete({ classId, subjectId });
    if (!result) {
      throw new NotFoundException('Không tìm thấy liên kết lớp-môn học');
    }
    return { message: 'Đã gỡ môn học khỏi lớp thành công' };
  }
}
