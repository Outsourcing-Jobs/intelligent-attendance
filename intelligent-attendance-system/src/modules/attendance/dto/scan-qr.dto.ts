import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ScanQrDto {
  @ApiProperty({
    description: 'Chuỗi Token HMAC nhận được sau khi quét mã QR trên màn hình',
    example: 'eyJzaWQiOiI2NzNjMDllODRiMmU4YTViMjNkOTFhYmMiLCJ0cyI6MTc0MTUzMjQwMDAwMCwiZXhwIjoxNzQxNTMyNDIwMDAwLCJub25jZSI6IjdiZDEyYTk0IiwidiI6MX0.8f1e2a3c...',
  })
  @IsString({ message: 'qrToken phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp mã QR Token từ máy chiếu' })
  qrToken: string;

  @ApiProperty({
    description: 'Mã định danh phần cứng thiết bị của sinh viên (Device ID)',
    example: 'web_a4b92c81e9f2a01b',
  })
  @IsString({ message: 'deviceId phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp mã định danh thiết bị (deviceId)' })
  deviceId: string;

  @ApiPropertyOptional({
    description: 'Vĩ độ GPS hiện tại của sinh viên',
    example: 21.028511,
  })
  @IsNumber({}, { message: 'userLat phải là số thực' })
  @IsOptional()
  userLat?: number;

  @ApiPropertyOptional({
    description: 'Kinh độ GPS hiện tại của sinh viên',
    example: 105.854167,
  })
  @IsNumber({}, { message: 'userLng phải là số thực' })
  @IsOptional()
  userLng?: number;

  @ApiPropertyOptional({
    description: 'Bán kính sai số của GPS (đơn vị: mét)',
    example: 8.5,
  })
  @IsNumber({}, { message: 'accuracy phải là số thực' })
  @IsOptional()
  accuracy?: number;

  @ApiPropertyOptional({
    description: 'Link ảnh chụp chân dung (nếu có yêu cầu xác thực khuôn mặt)',
    example: 'https://res.cloudinary.com/demo/image/upload/v1/face.jpg',
  })
  @IsString()
  @IsOptional()
  capturedImage?: string;

  @ApiPropertyOptional({
    description: 'Ghi chú thêm khi quét điểm danh',
    example: 'Quét QR tại dãy ghế đầu phòng A2.304',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
