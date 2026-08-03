import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@ApiTags('Semesters')
@ApiBearerAuth('firebase-token')
@Controller('semesters')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @ApiOperation({ summary: 'Lấy danh sách học kỳ (có thể lọc theo năm học)' })
  @ApiQuery({ name: 'academicYearId', required: false, description: 'Lọc theo ID năm học' })
  @ApiOkResponse({ description: 'Danh sách học kỳ' })
  @UseGuards(FirebaseAuthGuard)
  @Get()
  findAll(@Query('academicYearId') academicYearId?: string) {
    return this.semesterService.findAll(academicYearId);
  }

  @ApiOperation({ summary: 'Xem chi tiết học kỳ theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của Semester' })
  @ApiOkResponse({ description: 'Chi tiết học kỳ' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.semesterService.findById(id);
  }

  @ApiOperation({ summary: 'Tạo học kỳ mới (chỉ Admin)' })
  @ApiOkResponse({ description: 'Tạo học kỳ thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateSemesterDto) {
    return this.semesterService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật học kỳ (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của Semester cần sửa' })
  @ApiOkResponse({ description: 'Cập nhật học kỳ thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSemesterDto) {
    return this.semesterService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa học kỳ (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của Semester cần xóa' })
  @ApiOkResponse({ description: 'Xóa học kỳ thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.semesterService.remove(id);
  }
}
