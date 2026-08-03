import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Semester, SemesterDocument } from './schemas/semester.schema';
import { AcademicYear, AcademicYearDocument } from '../academic-year/schemas/academic-year.schema';
import { CourseSection, CourseSectionDocument } from '../course-section/schemas/course-section.schema';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Injectable()
export class SemesterService {
  constructor(
    @InjectModel(Semester.name) private semesterModel: Model<SemesterDocument>,
    @InjectModel(AcademicYear.name) private academicYearModel: Model<AcademicYearDocument>,
    @InjectModel(CourseSection.name) private courseSectionModel: Model<CourseSectionDocument>,
  ) {}

  async findAll(academicYearId?: string) {
    const filter: any = {};
    if (academicYearId) {
      filter.academicYearId = academicYearId;
    }
    return this.semesterModel
      .find(filter)
      .populate('academicYearId', 'name startDate endDate status')
      .sort({ startDate: -1 })
      .lean();
  }

  async findById(id: string) {
    const semester = await this.semesterModel
      .findById(id)
      .populate('academicYearId', 'name startDate endDate status')
      .lean();
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại');
    }
    return semester;
  }

  async create(dto: CreateSemesterDto) {
    this.validateDateRange(dto.startDate, dto.endDate);

    const academicYear = await this.academicYearModel.findById(dto.academicYearId).lean();
    if (!academicYear) {
      throw new NotFoundException('Năm học không tồn tại');
    }

    this.validateWithinAcademicYear(dto.startDate, dto.endDate, academicYear);
    await this.checkOverlap(dto.academicYearId, dto.startDate, dto.endDate);

    return this.semesterModel.create(dto);
  }

  async update(id: string, dto: UpdateSemesterDto) {
    const current = await this.semesterModel.findById(id).lean();
    if (!current) {
      throw new NotFoundException('Học kỳ không tồn tại');
    }

    const academicYearId = dto.academicYearId || current.academicYearId.toString();
    const startDate = dto.startDate || current.startDate.toISOString();
    const endDate = dto.endDate || current.endDate.toISOString();

    this.validateDateRange(startDate, endDate);

    const academicYear = await this.academicYearModel.findById(academicYearId).lean();
    if (!academicYear) {
      throw new NotFoundException('Năm học không tồn tại');
    }

    this.validateWithinAcademicYear(startDate, endDate, academicYear);
    await this.checkOverlap(academicYearId, startDate, endDate, id);

    const semester = await this.semesterModel.findByIdAndUpdate(id, dto, { new: true });
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại');
    }
    return semester;
  }

  async remove(id: string) {
    const hasCourseSections = await this.courseSectionModel.exists({ semesterId: id });
    if (hasCourseSections) {
      throw new BadRequestException('Không thể xóa học kỳ đang có lớp học phần. Hãy xóa các lớp học phần trước');
    }

    const semester = await this.semesterModel.findByIdAndDelete(id);
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại');
    }
    return { message: 'Đã xóa học kỳ thành công' };
  }

  private validateDateRange(startDate: string, endDate: string) {
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }
  }

  private validateWithinAcademicYear(
    startDate: string,
    endDate: string,
    academicYear: any,
  ) {
    const semStart = new Date(startDate);
    const semEnd = new Date(endDate);
    const ayStart = new Date(academicYear.startDate);
    const ayEnd = new Date(academicYear.endDate);

    if (semStart < ayStart || semEnd > ayEnd) {
      throw new BadRequestException(
        `Khoảng ngày của học kỳ phải nằm trong khoảng ngày của năm học (${academicYear.startDate.toISOString().split('T')[0]} - ${academicYear.endDate.toISOString().split('T')[0]})`,
      );
    }
  }

  /**
   * Check for overlapping semesters within the same academic year.
   * Two date ranges overlap if: startA < endB AND startB < endA
   */
  private async checkOverlap(
    academicYearId: string,
    startDate: string,
    endDate: string,
    excludeId?: string,
  ) {
    const filter: any = {
      academicYearId,
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const overlapping = await this.semesterModel.findOne(filter).lean();
    if (overlapping) {
      throw new BadRequestException(
        `Khoảng ngày bị trùng với học kỳ "${overlapping.name}" (${overlapping.startDate.toISOString().split('T')[0]} - ${overlapping.endDate.toISOString().split('T')[0]})`,
      );
    }
  }
}
