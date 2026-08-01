import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ConfigService } from './config.service';
import { UpsertConfigDto } from './dto/upsert-config.dto';

@ApiTags('Configs')
@Controller('configs')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({
    summary: 'Lấy danh sách cấu hình hệ thống',
    description: 'Lấy tất cả hoặc lọc theo nhóm (`system`, `general`, `menu`). Mọi user đã đăng nhập đều có thể đọc.',
  })
  @ApiQuery({ name: 'group', required: false, example: 'system', description: 'Tên nhóm cấu hình' })
  @ApiOkResponse({ description: 'Danh sách cấu hình đã ép kiểu' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard)
  @Get()
  findByGroup(@Query('group') group?: string) {
    return group ? this.configService.getByGroup(group) : this.configService.getAll();
  }

  @ApiOperation({ summary: 'Lấy 1 giá trị cấu hình theo Key' })
  @ApiParam({ name: 'key', example: 'SYSTEM_NAME', description: 'Mã key cấu hình' })
  @ApiOkResponse({ description: 'Giá trị cấu hình đã ép đúng kiểu dữ liệu' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard)
  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.configService.getByKey(key);
  }

  @ApiOperation({
    summary: 'Tạo hoặc cập nhật cấu hình hệ thống (Admin)',
    description: 'Tạo mới hoặc cập nhật giá trị cho key tương ứng mà không cần khởi động lại ứng dụng. Yêu cầu quyền Admin.',
  })
  @ApiOkResponse({ description: 'Cập nhật/tạo mới cấu hình thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  upsert(@Body() dto: UpsertConfigDto) {
    return this.configService.upsert(dto.key, dto.value, dto.type, dto.group, dto.description);
  }
}
