import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendNotificationDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  recipientIds: string[];

  /**
   * Mã template đã đăng ký trong DB.
   * Nếu cung cấp, title/body sẽ được render từ template + variables.
   */
  @IsOptional()
  @IsString()
  templateCode?: string;

  /**
   * Biến dùng để render template ({{key}} → value).
   * Chỉ cần thiết khi dùng templateCode.
   */
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  /**
   * Tiêu đề thủ công (khi không dùng template).
   */
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * Nội dung thủ công (khi không dùng template).
   */
  @IsOptional()
  @IsString()
  body?: string;

  @IsString()
  @IsNotEmpty()
  eventType: string;

  /** Dữ liệu tuỳ chọn đính kèm */
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
