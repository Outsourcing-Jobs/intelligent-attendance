import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@ApiTags('Subjects')
@ApiBearerAuth('firebase-token')
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @ApiOperation({ summary: 'Lấy danh sách tất cả môn học' })
  @ApiOkResponse({ description: 'Danh sách môn học' })
  @UseGuards(FirebaseAuthGuard)
  @Get()
  findAll() {
    return this.subjectService.findAll();
  }

  @ApiOperation({ summary: 'Xem chi tiết môn học theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của Subject' })
  @ApiOkResponse({ description: 'Chi tiết môn học' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectService.findById(id);
  }

  @ApiOperation({ summary: 'Tạo môn học mới (chỉ Admin)' })
  @ApiOkResponse({ description: 'Tạo môn học thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật môn học (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của Subject cần sửa' })
  @ApiOkResponse({ description: 'Cập nhật môn học thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa môn học (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của Subject cần xóa' })
  @ApiOkResponse({ description: 'Xóa môn học thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectService.remove(id);
  }
}
