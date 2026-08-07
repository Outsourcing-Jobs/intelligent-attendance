import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeviceInfoDto {
  @ApiProperty({ example: 'c8f3b610-8b1e-4c70-9831-294b29d10e8d', description: 'Mã định danh thiết bị duy nhất' })
  @IsString()
  @IsNotEmpty({ message: 'deviceId không được để trống' })
  deviceId: string;

  @ApiPropertyOptional({ example: 'Chrome on Windows 11', description: 'Tên hiển thị của thiết bị' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({ example: 'web', description: 'Loại thiết bị: web, mobile, tablet' })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiPropertyOptional({ example: 'Windows 11', description: 'Hệ điều hành' })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({ example: 'Chrome 120.0', description: 'Trình duyệt' })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({ description: 'User Agent string' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ IP' })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class RejectDeviceDto {
  @ApiPropertyOptional({ example: 'Sinh viên báo không đúng thiết bị cá nhân', description: 'Lý do từ chối thiết bị' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class QueryDeviceDto {
  @ApiPropertyOptional({ description: 'Trạng thái thiết bị: approved, pending, rejected, inactive' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Trang hiện tại', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng phần tử mỗi trang', example: 10 })
  @IsOptional()
  limit?: number;
}

export class QueryLoginHistoryDto {
  @ApiPropertyOptional({ description: 'ID người dùng' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Trạng thái: success, pending_device, rejected_device, failed, logged_out' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Trang hiện tại', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng phần tử mỗi trang', example: 10 })
  @IsOptional()
  limit?: number;
}
