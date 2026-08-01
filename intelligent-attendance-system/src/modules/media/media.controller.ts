import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
import { CloudinaryService } from '../../config/cloudinary/cloudinary.service';

@ApiTags('Media - Upload')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @ApiOperation({
    summary: 'Upload 1 ảnh lẻ lên Cloudinary',
    description: 'Nhận tệp ảnh đơn lẻ (dưới 10MB, định dạng: jpg, jpeg, png, webp, gif) và upload trực tiếp lên Cloudinary. Trả về url và publicId.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'File ảnh đơn' },
      },
    },
  })
  @ApiOkResponse({ description: 'Upload ảnh thành công, trả về { url, publicId }' })
  @ApiUnauthorizedResponse({ description: 'Chưa xác thực Token' })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload/single')
  async uploadSingle(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.cloudinaryService.uploadImage(file, 'general');
  }

  @ApiOperation({
    summary: 'Upload nhiều ảnh (tối đa 10 ảnh) lên Cloudinary',
    description: 'Nhận mảng tệp ảnh và upload song song lên Cloudinary. Trả về mảng danh sách [{ url, publicId }, ...].',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Danh sách các file ảnh (tối đa 10 ảnh)',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Upload mảng ảnh thành công, trả về [{ url, publicId }]' })
  @ApiUnauthorizedResponse({ description: 'Chưa xác thực Token' })
  @UseInterceptors(FilesInterceptor('files', 10))
  @Post('upload/multiple')
  async uploadMultiple(
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    return this.cloudinaryService.uploadMultipleImages(files, 'general');
  }
}
