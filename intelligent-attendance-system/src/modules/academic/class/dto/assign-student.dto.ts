import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class AssignStudentDto {
  @ApiProperty({ example: '60f7a1b2c3d4e5f6a7b8c9d0', description: 'ID sinh viên cần thêm vào lớp', required: false })
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @ApiProperty({ example: ['60f7a1b2c3d4e5f6a7b8c9d0'], description: 'Danh sách ID sinh viên cần thêm vào lớp', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
}
