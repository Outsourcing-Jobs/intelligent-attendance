import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCourseSectionDto {
  @ApiProperty({ example: '60f7a1b2c3d4e5f6a7b8c9d0', description: 'ID môn học' })
  @IsMongoId()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: '60f7a1b2c3d4e5f6a7b8c9d0', description: 'ID học kỳ' })
  @IsMongoId()
  @IsNotEmpty()
  semesterId: string;

  @ApiProperty({ example: 'CS101-S1-2025-G01', description: 'Mã lớp học phần' })
  @IsString()
  @IsNotEmpty()
  sectionCode: string;

  @ApiProperty({ example: 40, description: 'Sĩ số tối đa' })
  @IsNumber()
  @Min(1)
  maxSize: number;

  @ApiProperty({ example: 'A301', description: 'Phòng học', required: false })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiProperty({ example: 'Thứ 2 - Tiết 1-3', description: 'Lịch học', required: false })
  @IsString()
  @IsOptional()
  schedule?: string;

  @ApiProperty({ example: 2, description: 'Thứ trong tuần (2: Thứ 2, ..., 8: CN)', required: false })
  @IsInt()
  @Min(2)
  @Max(8)
  @IsOptional()
  scheduleDayOfWeek?: number;

  @ApiProperty({ example: 1, description: 'Tiết bắt đầu (1-15)', required: false })
  @IsInt()
  @Min(1)
  @Max(15)
  @IsOptional()
  scheduleStartPeriod?: number;

  @ApiProperty({ example: 3, description: 'Số tiết học (1-10)', required: false })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  scheduleNumPeriods?: number;

  @ApiProperty({ example: 'open', enum: ['open', 'closed', 'cancelled'], required: false, default: 'open' })
  @IsIn(['open', 'closed', 'cancelled'])
  @IsOptional()
  status?: string;
}
