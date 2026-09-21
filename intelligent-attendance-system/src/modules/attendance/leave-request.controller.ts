import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto, ReviewLeaveRequestDto } from './dto/create-leave-request.dto';

@ApiTags('Leave Requests')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  private getUserId(user: any): string {
    return user._id || user.id || user.userId || user.firebaseUid;
  }

  @ApiOperation({ summary: 'Sinh viên tạo đơn xin nghỉ phép mới' })
  @Roles('student', 'teacher', 'lecturer', 'admin', 'super_admin')
  @Post()
  async createLeaveRequest(@CurrentUser() user: any, @Body() dto: CreateLeaveRequestDto) {
    const studentId = this.getUserId(user);
    return this.leaveRequestService.createLeaveRequest(studentId, dto);
  }

  @ApiOperation({ summary: 'Sinh viên xem danh sách đơn xin nghỉ cá nhân (hỗ trợ phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng bản ghi mỗi trang' })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc theo trạng thái đơn (pending, approved, rejected, cancelled)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo lý do, mã/tên môn hoặc loại nghỉ' })
  @Roles('student', 'teacher', 'lecturer', 'admin', 'super_admin')
  @Get('my')
  async getMyLeaveRequests(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const studentId = this.getUserId(user);
    return this.leaveRequestService.getMyLeaveRequests(studentId, { status, page, limit, search });
  }

  @ApiOperation({ summary: 'Giảng viên xem danh sách đơn xin nghỉ thuộc các lớp học phần phụ trách (hỗ trợ phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng bản ghi mỗi trang' })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc theo trạng thái đơn' })
  @ApiQuery({ name: 'courseSectionId', required: false, description: 'Lọc theo ID lớp học phần' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo sinh viên, lý do, môn học' })
  @Roles('teacher', 'lecturer', 'admin', 'super_admin')
  @Get('teacher')
  async getTeacherLeaveRequests(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('courseSectionId') courseSectionId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const teacherId = this.getUserId(user);
    return this.leaveRequestService.getTeacherLeaveRequests(teacherId, { status, courseSectionId, page, limit, search });
  }

  @ApiOperation({ summary: 'Lấy số lượng đơn xin nghỉ phép đang chờ duyệt (PENDING) dành cho Giảng viên' })
  @Roles('teacher', 'lecturer', 'admin', 'super_admin')
  @Get('pending-count')
  async getPendingCountForTeacher(@CurrentUser() user: any) {
    const teacherId = this.getUserId(user);
    const count = await this.leaveRequestService.getPendingCountForTeacher(teacherId);
    return { count };
  }

  @ApiOperation({ summary: 'Quản trị viên (Admin) xem tất cả các đơn xin nghỉ phép trong hệ thống (hỗ trợ phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Trang hiện tại' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số lượng bản ghi mỗi trang' })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc theo trạng thái đơn' })
  @ApiQuery({ name: 'courseSectionId', required: false, description: 'Lọc theo ID lớp học phần' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Lọc theo ID sinh viên' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo từ khóa' })
  @Roles('admin', 'super_admin')
  @Get('all')
  async getAllLeaveRequests(
    @Query('status') status?: string,
    @Query('courseSectionId') courseSectionId?: string,
    @Query('studentId') studentId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.leaveRequestService.getAllLeaveRequests({ status, courseSectionId, studentId, page, limit, search });
  }

  @ApiOperation({ summary: 'Xem chi tiết 1 đơn xin nghỉ phép kèm lịch sử xử lý' })
  @Get(':id')
  async getLeaveRequestDetail(@Param('id') id: string): Promise<any> {
    return this.leaveRequestService.getLeaveRequestDetail(id);
  }

  @ApiOperation({ summary: 'Sinh viên hủy đơn xin nghỉ phép đang ở trạng thái Chờ duyệt (PENDING)' })
  @Roles('student', 'teacher', 'lecturer', 'admin', 'super_admin')
  @Patch(':id/cancel')
  async cancelLeaveRequest(@Param('id') id: string, @CurrentUser() user: any) {
    const studentId = this.getUserId(user);
    return this.leaveRequestService.cancelLeaveRequest(id, studentId);
  }

  @ApiOperation({ summary: 'Giảng viên / Admin Phê duyệt đơn xin nghỉ phép (Cập nhật điểm danh -> EXCUSED)' })
  @Roles('teacher', 'lecturer', 'admin', 'super_admin')
  @Patch(':id/approve')
  async approveLeaveRequest(@Param('id') id: string, @CurrentUser() user: any) {
    const reviewerId = this.getUserId(user);
    return this.leaveRequestService.approveLeaveRequest(id, reviewerId);
  }

  @ApiOperation({ summary: 'Giảng viên / Admin Từ chối đơn xin nghỉ phép (kèm lý do từ chối)' })
  @Roles('teacher', 'lecturer', 'admin', 'super_admin')
  @Patch(':id/reject')
  async rejectLeaveRequest(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ReviewLeaveRequestDto,
  ) {
    const reviewerId = this.getUserId(user);
    return this.leaveRequestService.rejectLeaveRequest(id, reviewerId, dto);
  }
}
