import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email đăng nhập' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @ApiPropertyOptional({ example: true, description: 'Duy trì đăng nhập' })
  @IsOptional()
  @IsBoolean()
  remember?: boolean;

  @ApiPropertyOptional({ example: 'c8f3b610-8b1e-4c70-9831-294b29d10e8d', description: 'Mã định danh duy nhất của thiết bị' })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({ example: 'Chrome on Windows 11', description: 'Tên hiển thị của thiết bị' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiPropertyOptional({ example: 'web', description: 'Loại thiết bị: web, mobile' })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiPropertyOptional({ example: 'Windows 11', description: 'Hệ điều hành' })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({ example: 'Chrome 120', description: 'Trình duyệt' })
  @IsOptional()
  @IsString()
  browser?: string;
}
