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
import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@ApiTags('Academic Years')
@ApiBearerAuth('firebase-token')
@Controller('academic-years')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @ApiOperation({ summary: 'Lấy danh sách tất cả năm học' })
  @ApiOkResponse({ description: 'Danh sách năm học' })
  @UseGuards(FirebaseAuthGuard)
  @Get()
  findAll() {
    return this.academicYearService.findAll();
  }

  @ApiOperation({ summary: 'Xem chi tiết năm học theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của AcademicYear' })
  @ApiOkResponse({ description: 'Chi tiết năm học' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicYearService.findById(id);
  }

  @ApiOperation({ summary: 'Tạo năm học mới (chỉ Admin)' })
  @ApiOkResponse({ description: 'Tạo năm học thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateAcademicYearDto) {
    return this.academicYearService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật năm học (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của AcademicYear cần sửa' })
  @ApiOkResponse({ description: 'Cập nhật năm học thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAcademicYearDto) {
    return this.academicYearService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa năm học (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của AcademicYear cần xóa' })
  @ApiOkResponse({ description: 'Xóa năm học thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicYearService.remove(id);
  }
}
