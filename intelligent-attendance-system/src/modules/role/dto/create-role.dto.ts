import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'teacher', description: 'Mã định danh duy nhất cho role' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Giáo viên', description: 'Tên hiển thị' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: ['attendance:view', 'schedule:view'], required: false })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 'Vai trò dành cho giảng viên/giáo viên', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
