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
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AssignSubjectDto } from './dto/assign-subject.dto';
import { AssignStudentDto } from './dto/assign-student.dto';

@ApiTags('Classes')
@ApiBearerAuth('firebase-token')
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // --- Class CRUD ---

  @ApiOperation({ summary: 'Lấy danh sách lớp (phân quyền theo Vai trò)' })
  @ApiOkResponse({ description: 'Danh sách lớp' })
  @UseGuards(FirebaseAuthGuard)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.classService.findAll(user);
  }

  @ApiOperation({ summary: 'Xem chi tiết lớp theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của Class' })
  @ApiOkResponse({ description: 'Chi tiết lớp' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classService.findById(id);
  }

  @ApiOperation({ summary: 'Tạo lớp mới (chỉ Admin)' })
  @ApiOkResponse({ description: 'Tạo lớp thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật lớp (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của Class cần sửa' })
  @ApiOkResponse({ description: 'Cập nhật lớp thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa lớp (chỉ Admin)' })
  @ApiParam({ name: 'id', description: 'ObjectId của Class cần xóa' })
  @ApiOkResponse({ description: 'Xóa lớp thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classService.remove(id);
  }

  @ApiOperation({ summary: 'Lấy danh sách sinh viên thuộc lớp sinh viên' })
  @ApiParam({ name: 'classId', description: 'ObjectId của Class' })
  @ApiOkResponse({ description: 'Danh sách sinh viên' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':classId/students')
  getStudents(@Param('classId') classId: string): Promise<any[]> {
    return this.classService.getStudents(classId);
  }

  @ApiOperation({ summary: 'Thêm 1 hoặc nhiều sinh viên vào lớp (chỉ Admin / Giảng viên)' })
  @ApiParam({ name: 'classId', description: 'ObjectId của Class' })
  @ApiOkResponse({ description: 'Thêm sinh viên vào lớp thành công' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @Post(':classId/students')
  assignStudent(@Param('classId') classId: string, @Body() dto: AssignStudentDto) {
    return this.classService.assignStudent(classId, dto);
  }

  @ApiOperation({ summary: 'Gỡ sinh viên khỏi lớp (chỉ Admin / Giảng viên)' })
  @ApiParam({ name: 'classId', description: 'ObjectId của Class' })
  @ApiParam({ name: 'studentId', description: 'ObjectId của Sinh viên' })
  @ApiOkResponse({ description: 'Gỡ sinh viên khỏi lớp thành công' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @Delete(':classId/students/:studentId')
  removeStudentFromClass(@Param('classId') classId: string, @Param('studentId') studentId: string) {
    return this.classService.removeStudentFromClass(classId, studentId);
  }

  // --- ClassSubject management ---

  @ApiOperation({ summary: 'Lấy danh sách môn học của lớp' })
  @ApiParam({ name: 'classId', description: 'ObjectId của Class' })
  @ApiOkResponse({ description: 'Danh sách môn học đã gán cho lớp' })
  @UseGuards(FirebaseAuthGuard)
  @Get(':classId/subjects')
  getSubjects(@Param('classId') classId: string) {
    return this.classService.getSubjects(classId);
  }

  @ApiOperation({ summary: 'Gán môn học vào lớp (chỉ Admin)' })
  @ApiParam({ name: 'classId', description: 'ObjectId của Class' })
  @ApiOkResponse({ description: 'Gán môn học thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':classId/subjects')
  assignSubject(@Param('classId') classId: string, @Body() dto: AssignSubjectDto) {
    return this.classService.assignSubject(classId, dto.subjectId);
  }

  @ApiOperation({ summary: 'Gỡ môn học khỏi lớp (chỉ Admin)' })
  @ApiParam({ name: 'classId', description: 'ObjectId của Class' })
  @ApiParam({ name: 'subjectId', description: 'ObjectId của Subject' })
  @ApiOkResponse({ description: 'Gỡ môn học thành công' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':classId/subjects/:subjectId')
  removeSubject(@Param('classId') classId: string, @Param('subjectId') subjectId: string) {
    return this.classService.removeSubject(classId, subjectId);
  }
}
