import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ example: 'teacher', description: 'Mã role mới' })
  @IsString()
  @IsNotEmpty()
  roleCode: string;
}
