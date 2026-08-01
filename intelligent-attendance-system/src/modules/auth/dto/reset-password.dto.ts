import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'c-WoDOr8zOtGjtHinQJtn-fN6Y353mQqQfKuEaOG7hcAAAGfsmBqYQ',
    description: 'Mã oobCode nhận được từ URL email reset password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mã oobCode không được để trống' })
  oobCode: string;

  @ApiProperty({
    example: 'NewPassword123@',
    description: 'Mật khẩu mới (Tối thiểu 6 ký tự, chứa chữ hoa, chữ thường, số và ký tự đặc biệt)',
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\W_]).{6,}$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&#...)',
  })
  newPassword: string;
}
