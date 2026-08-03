import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class AssignLecturerDto {
  @ApiProperty({ example: '60f7a1b2c3d4e5f6a7b8c9d0', description: 'ID người dùng (role giảng viên)' })
  @IsMongoId()
  @IsNotEmpty()
  lecturerId: string;

  @ApiProperty({ example: 'main', enum: ['main', 'assistant'], required: false, default: 'main' })
  @IsIn(['main', 'assistant'])
  @IsOptional()
  role?: string;
}
