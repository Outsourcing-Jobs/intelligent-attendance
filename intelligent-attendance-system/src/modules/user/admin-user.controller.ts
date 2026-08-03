import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserService } from './user.service';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Lấy danh sách người dùng (Admin)',
    description: 'Hỗ trợ phân trang và tìm kiếm theo từ khóa (email, họ tên, sđt). Chỉ Admin mới có quyền gọi.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng bản ghi mỗi trang' })
  @ApiQuery({ name: 'keyword', required: false, example: 'nguyen', description: 'Từ khóa tìm kiếm' })
  @ApiOkResponse({ description: 'Lấy danh sách người dùng thành công' })
  @ApiForbiddenResponse({ description: 'Không có quyền Admin' })
  @Get()
  findAll(@Query() query: { page?: number; limit?: number; keyword?: string }) {
    return this.userService.findAll(query);
  }

  @ApiOperation({ summary: 'Xem chi tiết người dùng theo MongoDB ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của người dùng trong MongoDB' })
  @ApiOkResponse({ description: 'Lấy thông tin chi tiết người dùng thành công' })
  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @ApiOperation({ summary: 'Lấy danh sách Giảng viên để phân công (Admin)' })
  @ApiOkResponse({ description: 'Lấy danh sách giảng viên thành công' })
  @Get('lecturers')
  getLecturers() {
    return this.userService.findLecturers();
  }

  @ApiOperation({
    summary: 'Admin khởi tạo tài khoản mới',
    description: 'Tự động đăng ký tài khoản trên Firebase Auth và lưu thông tin người dùng kèm Role vào MongoDB.',
  })
  @ApiOkResponse({ description: 'Tạo người dùng mới thành công' })
  @Post()
  create(@Body() dto: CreateUserByAdminDto) {
    return this.userService.createByAdmin(dto);
  }

  @ApiOperation({
    summary: 'Thay đổi Role của người dùng',
    description: 'Đổi roleId của user và thu hồi Refresh Token cũ để buộc lấy token có quyền mới.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId của user cần đổi role' })
  @ApiOkResponse({ description: 'Đổi role và thu hồi token thành công' })
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.userService.updateRole(id, dto.roleCode);
  }

  @ApiOperation({
    summary: 'Khóa tài khoản khẩn cấp (Ban)',
    description: 'Đổi trạng thái sang `banned`, thu hồi Refresh Token và Disable tài khoản trực tiếp trên Firebase.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId của user cần khóa' })
  @ApiOkResponse({ description: 'Khóa tài khoản thành công' })
  @Patch(':id/ban')
  ban(@Param('id') id: string) {
    return this.userService.banUser(id);
  }

  @ApiOperation({
    summary: 'Mở khóa tài khoản (Unban)',
    description: 'Đổi trạng thái sang `active` và Enable tài khoản trên Firebase Auth.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId của user cần mở khóa' })
  @ApiOkResponse({ description: 'Mở khóa tài khoản thành công' })
  @Patch(':id/unban')
  unban(@Param('id') id: string) {
    return this.userService.unbanUser(id);
  }

  @ApiOperation({
    summary: 'Xóa hoàn toàn tài khoản',
    description: 'Xóa tài khoản khỏi cả Firebase Auth và MongoDB.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId của user cần xóa' })
  @ApiOkResponse({ description: 'Xóa tài khoản thành công' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.removeUser(id);
  }
}
