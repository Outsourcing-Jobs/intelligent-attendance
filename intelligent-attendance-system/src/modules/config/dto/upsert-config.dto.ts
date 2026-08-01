import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertConfigDto {
  @ApiProperty({ example: 'SYSTEM_NAME' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'Hệ thống điểm danh' })
  value: any;

  @ApiProperty({ example: 'string', enum: ['string', 'number', 'boolean', 'json'], required: false })
  @IsOptional()
  @IsIn(['string', 'number', 'boolean', 'json'])
  type?: string;

  @ApiProperty({ example: 'system', enum: ['system', 'menu', 'general'], required: false })
  @IsOptional()
  @IsIn(['system', 'menu', 'general'])
  group?: string;

  @ApiProperty({ example: 'Tên hệ thống hiển thị trên trang chủ', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
