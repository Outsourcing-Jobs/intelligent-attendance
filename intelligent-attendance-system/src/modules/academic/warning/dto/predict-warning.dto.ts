import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PredictWarningDto {
  @ApiProperty({
    description: 'ID của sinh viên (ObjectId User)',
    example: '6a71f25456c0266186cf59ad',
  })
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiPropertyOptional({
    description: 'ID của lớp học phần (ObjectId CourseSection)',
    example: '6a71f25956c0266186cf5ab6',
  })
  @IsString()
  @IsOptional()
  course_section_id?: string;

  @ApiPropertyOptional({
    description: 'Bí danh ID lớp học phần (tương đương course_section_id)',
    example: '6a71f25956c0266186cf5ab6',
  })
  @IsString()
  @IsOptional()
  class_id?: string;
}
