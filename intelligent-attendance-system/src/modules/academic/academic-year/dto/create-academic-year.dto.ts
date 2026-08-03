import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2025-2026', description: 'Tên năm học (ví dụ: 2025-2026)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2025-09-01', description: 'Ngày bắt đầu năm học' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-06-30', description: 'Ngày kết thúc năm học' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive'], required: false, default: 'inactive' })
  @IsIn(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
