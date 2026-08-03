import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSemesterDto {
  @ApiProperty({ example: '60f7a1b2c3d4e5f6a7b8c9d0', description: 'ID của năm học' })
  @IsMongoId()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ example: 'Học kỳ 1', description: 'Tên học kỳ (Học kỳ 1, Học kỳ 2, Học kỳ hè)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2025-09-01', description: 'Ngày bắt đầu học kỳ' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-01-15', description: 'Ngày kết thúc học kỳ' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'upcoming', enum: ['upcoming', 'active', 'closed'], required: false, default: 'upcoming' })
  @IsIn(['upcoming', 'active', 'closed'])
  @IsOptional()
  status?: string;
}
