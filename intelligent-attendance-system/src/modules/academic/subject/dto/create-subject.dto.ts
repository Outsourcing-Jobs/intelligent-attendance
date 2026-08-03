import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'CS101', description: 'Mã môn học (duy nhất)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Nhập môn lập trình', description: 'Tên môn học' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 3, description: 'Số tín chỉ' })
  @IsNumber()
  @Min(1)
  credits: number;

  @ApiProperty({ example: '60f7a1b2c3d4e5f6a7b8c9d0', description: 'ID môn tiên quyết (nullable)', required: false })
  @IsMongoId()
  @IsOptional()
  prerequisiteSubjectId?: string;

  @ApiProperty({ example: 'Môn học giới thiệu về lập trình cơ bản', description: 'Mô tả môn học', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
