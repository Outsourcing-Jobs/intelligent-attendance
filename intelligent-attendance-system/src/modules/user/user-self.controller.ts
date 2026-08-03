import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users - Me')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard)
@Controller('users/me')
export class UserSelfController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @ApiOperation({
    summary: 'Xem thông tin trang cá nhân',
    description: 'Lấy đầy đủ thông tin profile của chính người dùng đang đăng nhập.',
  })
  @ApiOkResponse({ description: 'Lấy thông tin cá nhân thành công' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc Token không hợp lệ' })
  @Get()
  getProfile(@CurrentUser() user: any): Promise<any> {
    return this.userService.findByFirebaseUid(user.firebaseUid);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin cá nhân',
    description: 'Cho phép cập nhật các thông tin cá nhân như họ tên, số điện thoại.',
  })
  @ApiOkResponse({ description: 'Cập nhật profile thành công' })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ' })
  @Patch()
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.firebaseUid, dto);
  }

  @ApiOperation({
    summary: 'Upload và đổi ảnh đại diện (Avatar)',
    description: 'Tải tệp ảnh avatar lên Cloudinary, tự động xóa avatar cũ và cập nhật `avatarUrl` vào MongoDB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh avatar (tối đa 5MB, định dạng: jpg, jpeg, png, webp)',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Upload avatar mới và lưu vào profile thành công' })
  @UseInterceptors(FileInterceptor('file'))
  @Post('avatar')
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const current = await this.userService.findByFirebaseUid(user.firebaseUid);
    if (current?.avatarPublicId) {
      await this.cloudinaryService.deleteImage(current.avatarPublicId);
    }

    const { url, publicId } = await this.cloudinaryService.uploadImage(file, 'avatars');
    return this.userService.updateProfile(user.firebaseUid, {
      avatarUrl: url,
      avatarPublicId: publicId,
    });
  }
}
