import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: 'Quản lý người dùng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '/users' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'user-icon', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: '664f1c2e...', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ example: ['user:read'], required: false })
  @IsArray()
  @IsOptional()
  permissions?: string[];
}
