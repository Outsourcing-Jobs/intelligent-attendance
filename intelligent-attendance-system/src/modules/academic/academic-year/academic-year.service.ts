import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AcademicYear, AcademicYearDocument } from './schemas/academic-year.schema';
import { Semester, SemesterDocument } from '../semester/schemas/semester.schema';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectModel(AcademicYear.name) private academicYearModel: Model<AcademicYearDocument>,
    @InjectModel(Semester.name) private semesterModel: Model<SemesterDocument>,
  ) {}

  async findAll() {
    return this.academicYearModel.find().sort({ startDate: -1 }).lean();
  }

  async findById(id: string) {
    const academicYear = await this.academicYearModel.findById(id).lean();
    if (!academicYear) {
      throw new NotFoundException('Năm học không tồn tại');
    }
    return academicYear;
  }

  async create(dto: CreateAcademicYearDto) {
    this.validateDateRange(dto.startDate, dto.endDate);

    const existing = await this.academicYearModel.findOne({ name: dto.name });
    if (existing) {
      throw new BadRequestException('Tên năm học đã tồn tại');
    }

    return this.academicYearModel.create(dto);
  }

  async update(id: string, dto: UpdateAcademicYearDto) {
    if (dto.startDate || dto.endDate) {
      const current = await this.academicYearModel.findById(id).lean();
      if (!current) {
        throw new NotFoundException('Năm học không tồn tại');
      }
      const startDate = dto.startDate || current.startDate.toISOString();
      const endDate = dto.endDate || current.endDate.toISOString();
      this.validateDateRange(startDate, endDate);

      // Check if any existing semester falls outside the new date range
      const outOfRangeSemester = await this.semesterModel.findOne({
        academicYearId: id,
        $or: [
          { startDate: { $lt: new Date(startDate) } },
          { endDate: { $gt: new Date(endDate) } },
        ],
      }).lean();

      if (outOfRangeSemester) {
        throw new BadRequestException(
          `Không thể cập nhật khoảng ngày vì học kỳ "${outOfRangeSemester.name}" nằm ngoài khoảng ngày mới`,
        );
      }
    }

    if (dto.name) {
      const existing = await this.academicYearModel.findOne({ name: dto.name, _id: { $ne: id } });
      if (existing) {
        throw new BadRequestException('Tên năm học đã tồn tại');
      }
    }

    const academicYear = await this.academicYearModel.findByIdAndUpdate(id, dto, { new: true });
    if (!academicYear) {
      throw new NotFoundException('Năm học không tồn tại');
    }
    return academicYear;
  }

  async remove(id: string) {
    const hasSemesters = await this.semesterModel.exists({ academicYearId: id });
    if (hasSemesters) {
      throw new BadRequestException('Không thể xóa năm học đang có học kỳ. Hãy xóa các học kỳ trước');
    }

    const academicYear = await this.academicYearModel.findByIdAndDelete(id);
    if (!academicYear) {
      throw new NotFoundException('Năm học không tồn tại');
    }
    return { message: 'Đã xóa năm học thành công' };
  }

  private validateDateRange(startDate: string, endDate: string) {
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }
  }
}
