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
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CourseSectionService } from './course-section.service';
import { CreateCourseSectionDto } from './dto/create-course-section.dto';
import { UpdateCourseSectionDto } from './dto/update-course-section.dto';
import { AssignLecturerDto } from './dto/assign-lecturer.dto';

@ApiTags('Course Sections')
@ApiBearerAuth('firebase-token')
@Controller('course-sections')
export class CourseSectionController {
  constructor(private readonly courseSectionService: CourseSectionService) { }

  @ApiOperation({ summary: 'Lấy danh sách Giảng viên phục vụ chọn dropdown' })
  @ApiOkResponse({ description: 'Danh sách giảng viên' })
  @UseGuards(FirebaseAuthGuard)
  @Get('lecturers-list')
  getLecturersList(): Promise<any[]> {
    return this.courseSectionService.getLecturersList();
  }

  @ApiOperation({ summary: 'Lấy danh sách lớp học phần (phân quyền theo Vai trò)' })
  @ApiQuery({ name: 'semesterId', required: false, description: 'Lọc theo ID học kỳ' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Lọc theo ID môn học' })
  @ApiOkResponse({ description: 'Danh sách lớp học phần' })
  @UseGuards(FirebaseAuthGuard)
  @Get()
  findAll(
    @Query('semesterId') semesterId?: string,
    @Query('subjectId') subjectId?: string,
    @CurrentUser() user?: any,
  ): Promise<any[]> {
    return this.courseSectionService.findAll(semesterId, subjectId, user);
  }

  @ApiOperation({ summary: 'Lấy tất cả các buổi học của User hiện tại (phục vụ lịch cá nhân)' })
  @ApiOkResponse({ description: 'Danh sách các buổi học của người dùng hiện tại' })
  @UseGuards(FirebaseAuthGuard)
  @Get('my-sessions')
  getMySessions(@CurrentUser() user: any): Promise<any[]> {
    return this.courseSectionService.getMySessions(user);
  }

  @ApiOperation({ summary: 'Xem chi tiết lớp học phần theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection' })
  @ApiOkResponse({ description: 'Chi tiết lớp học phần' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.courseSectionService.findById(id);
  }

  @ApiOperation({ summary: 'Tạo lớp học phần mới (chỉ Admin)' })
  @ApiOkResponse({ description: 'Tạo lớp học phần thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateCourseSectionDto) {
    return this.courseSectionService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật lớp học phần (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection cần sửa' })
  @ApiOkResponse({ description: 'Cập nhật lớp học phần thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseSectionDto) {
    return this.courseSectionService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa lớp học phần (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection cần xóa' })
  @ApiOkResponse({ description: 'Xóa lớp học phần thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseSectionService.remove(id);
  }

  // --- Lecturer Assignment for CourseSection ---

  @ApiOperation({ summary: 'Lấy danh sách giảng viên của lớp học phần' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection' })
  @ApiOkResponse({ description: 'Danh sách giảng viên phân công' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':id/lecturers')
  getLecturers(@Param('id') id: string) {
    return this.courseSectionService.getLecturers(id);
  }

  @ApiOperation({ summary: 'Phân công Giảng viên cho lớp học phần (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection' })
  @ApiOkResponse({ description: 'Phân công giảng viên thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/lecturers')
  assignLecturer(@Param('id') id: string, @Body() dto: AssignLecturerDto) {
    return this.courseSectionService.assignLecturer(id, dto.lecturerId, dto.role || 'main');
  }

  @ApiOperation({ summary: 'Gỡ Giảng viên khỏi lớp học phần (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection' })
  @ApiParam({ name: 'lecturerId', description: 'ObjectId của User giảng viên' })
  @ApiOkResponse({ description: 'Gỡ giảng viên thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id/lecturers/:lecturerId')
  removeLecturer(@Param('id') id: string, @Param('lecturerId') lecturerId: string) {
    return this.courseSectionService.removeLecturer(id, lecturerId);
  }

  @ApiOperation({ summary: 'Lấy danh sách sinh viên đăng ký lớp học phần' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection' })
  @ApiOkResponse({ description: 'Danh sách sinh viên học phần' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':id/students')
  getStudents(@Param('id') id: string): Promise<any[]> {
    return this.courseSectionService.getStudents(id);
  }

  @ApiOperation({ summary: 'Lấy danh sách các buổi học của lớp học phần' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection' })
  @ApiOkResponse({ description: 'Danh sách buổi học' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':id/sessions')
  getSessions(@Param('id') id: string): Promise<any[]> {
    return this.courseSectionService.getSessions(id);
  }

  @ApiOperation({ summary: 'Cập nhật một buổi học cụ thể (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection' })
  @ApiParam({ name: 'sessionId', description: 'ObjectId của ClassSession' })
  @ApiOkResponse({ description: 'Cập nhật buổi học thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/sessions/:sessionId')
  updateSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Body() body: {
      lecturerId?: string | null;
      room?: string;
      status?: string;
      date?: string;
      startPeriod?: number;
      numPeriods?: number;
    },
  ) {
    return this.courseSectionService.updateSession(id, sessionId, body);
  }

  @ApiOperation({ summary: 'Sinh viên đăng ký lớp học phần' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection' })
  @ApiOkResponse({ description: 'Đăng ký thành công' })
  @UseGuards(FirebaseAuthGuard)
  @Post(':id/enroll')
  enroll(@Param('id') id: string, @CurrentUser() user: any) {
    return this.courseSectionService.enroll(id, user._id);
  }

  @ApiOperation({ summary: 'Sinh viên hủy đăng ký lớp học phần' })
  @ApiParam({ name: 'id', description: 'ObjectId của CourseSection' })
  @ApiOkResponse({ description: 'Hủy đăng ký thành công' })
  @UseGuards(FirebaseAuthGuard)
  @Post(':id/withdraw')
  withdraw(@Param('id') id: string, @CurrentUser() user: any) {
    return this.courseSectionService.withdraw(id, user._id);
  }
}
