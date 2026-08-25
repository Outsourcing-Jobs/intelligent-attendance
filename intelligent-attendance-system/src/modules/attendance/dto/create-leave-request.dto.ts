import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveRequestDto {
  @ApiProperty({ description: 'ObjectId của Lớp học phần' })
  @IsNotEmpty({ message: 'Vui lòng chọn lớp học phần' })
  @IsString()
  courseSectionId: string;

  @ApiPropertyOptional({ description: 'ObjectId của Buổi học cụ thể (nếu có)' })
  @IsOptional()
  @IsString()
  classSessionId?: string;

  @ApiProperty({ enum: ['sick', 'personal', 'family', 'other'], description: 'Loại nghỉ phép' })
  @IsNotEmpty({ message: 'Vui lòng chọn loại nghỉ phép' })
  @IsEnum(['sick', 'personal', 'family', 'other'], { message: 'Loại nghỉ phép không hợp lệ' })
  leaveType: string;

  @ApiProperty({ description: 'Lý do nghỉ phép' })
  @IsNotEmpty({ message: 'Lý do nghỉ không được để trống' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Ngày bắt đầu nghỉ (ISO string)' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  fromDate: string;

  @ApiProperty({ description: 'Ngày kết thúc nghỉ (ISO string)' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  toDate: string;

  @ApiPropertyOptional({ description: 'URL file minh chứng' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class ReviewLeaveRequestDto {
  @ApiPropertyOptional({ description: 'Lý do từ chối (bắt buộc khi reject)' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
