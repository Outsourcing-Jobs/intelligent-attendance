import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAttendanceStatusDto {
  @ApiProperty({
    enum: ['present', 'late', 'absent', 'excused', 'early_leave'],
    example: 'excused',
    description: 'Trạng thái điểm danh mới được điều chỉnh',
  })
  @IsEnum(['present', 'late', 'absent', 'excused', 'early_leave'], {
    message: 'Trạng thái không hợp lệ. Cho phép: present, late, absent, excused, early_leave',
  })
  @IsNotEmpty({ message: 'Trạng thái điểm danh không được để trống' })
  status: string;

  @ApiProperty({
    example: 'Sinh viên có đơn xin phép được duyệt bổ sung',
    description: 'Lý do/ghi chú điều chỉnh điểm danh',
  })
  @IsString({ message: 'Lý do phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Lý do điều chỉnh không được để trống' })
  reason: string;
}
