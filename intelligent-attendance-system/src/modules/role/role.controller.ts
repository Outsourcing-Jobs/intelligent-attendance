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
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Roles')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Lấy danh sách tất cả các Role trong hệ thống' })
  @ApiOkResponse({ description: 'Danh sách các vai trò' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @Get()
  findAll(): Promise<any[]> {
    return this.roleService.findAll();
  }

  @ApiOperation({ summary: 'Lấy danh sách các quyền hạn hệ thống khả dụng' })
  @ApiOkResponse({ description: 'Danh sách quyền hạn' })
  @Get('permissions')
  getPermissions(): Promise<any[]> {
    return this.roleService.getSystemPermissions();
  }

  @ApiOperation({ summary: 'Xem chi tiết 1 Role theo MongoDB ObjectId' })
  @ApiParam({ name: 'id', description: 'ObjectId của Role' })
  @ApiOkResponse({ description: 'Chi tiết thông tin vai trò' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.roleService.findById(id);
  }

  @ApiOperation({ summary: 'Tạo một Role mới' })
  @ApiOkResponse({ description: 'Tạo role mới thành công' })
  @Post()
  create(@Body() dto: CreateRoleDto): Promise<any> {
    return this.roleService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin/quyền hạn của 1 Role' })
  @ApiParam({ name: 'id', description: 'ObjectId của Role cần sửa' })
  @ApiOkResponse({ description: 'Cập nhật role thành công' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto): Promise<any> {
    return this.roleService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Xóa Role',
    description: 'Chặn không cho xóa nếu Role đang được gán cho người dùng.',
  })
  @ApiParam({ name: 'id', description: 'ObjectId của Role cần xóa' })
  @ApiOkResponse({ description: 'Xóa role thành công' })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.roleService.remove(id);
  }
}
