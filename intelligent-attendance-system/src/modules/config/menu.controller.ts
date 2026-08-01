import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@ApiTags('Menus')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({
    summary: 'Lấy cây Menu dành riêng cho User hiện tại',
    description: 'Tự động lọc các menu theo quyền (`permissions`) của người dùng và trả về cấu trúc cây Cha - Con.',
  })
  @ApiOkResponse({ description: 'Cây danh mục menu cho Sidebar' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard)
  @Get()
  getMyMenu(@CurrentUser() user: any) {
    return this.menuService.getMenuForUser(user.permissions || []);
  }

  @ApiOperation({ summary: 'Admin lấy danh sách tất cả các Menu' })
  @ApiOkResponse({ description: 'Danh sách phẳng tất cả các menu' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  findAll() {
    return this.menuService.findAll();
  }

  @ApiOperation({ summary: 'Tạo một Menu mới (Admin)' })
  @ApiOkResponse({ description: 'Tạo menu thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin Menu (Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của Menu cần sửa' })
  @ApiOkResponse({ description: 'Sửa menu thành công' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa Menu (Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của Menu cần xóa' })
  @ApiOkResponse({ description: 'Xóa menu thành công' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
