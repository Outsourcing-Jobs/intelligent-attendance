import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'CS2025-A', description: 'Tên lớp (khóa sinh viên)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2025, description: 'Năm khóa học' })
  @IsNumber()
  @Min(2000)
  cohortYear: number;

  @ApiProperty({ example: '60f7a1b2c3d4e5f6a7b8c9d0', description: 'ID ngành học (cho tương lai)', required: false })
  @IsMongoId()
  @IsOptional()
  majorId?: string;

  @ApiProperty({ example: '60f7a1b2c3d4e5f6a7b8c9d0', description: 'ID giảng viên chủ nhiệm', required: false })
  @IsMongoId()
  @IsOptional()
  homeroomLecturerId?: string;
}
