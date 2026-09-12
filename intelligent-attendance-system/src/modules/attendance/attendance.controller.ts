import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ClientIp } from '../../common/decorators/client-ip.decorator';
import { AttendanceService } from './attendance.service';
import { AttendanceScoreService } from './attendance-score.service';
import { WarningService } from '../academic/warning/warning.service';
import { CheckInDto } from './dto/check-in.dto';
import { ScanQrDto } from './dto/scan-qr.dto';
import { UpdateAttendanceConfigDto } from './dto/update-attendance-config.dto';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto';

@ApiTags('Attendances')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard)
@Controller('attendances')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceScoreService: AttendanceScoreService,
    private readonly warningService: WarningService,
  ) {}

  @ApiOperation({
    summary: 'Lấy các tiết/buổi học hôm nay của sinh viên',
    description: 'Tự động lấy thông tin môn học, phòng học, tiết học và trạng thái điểm danh hiện tại của sinh viên.',
  })
  @Get('today-session')
  async getTodaySessions(@CurrentUser() user: any) {
    const studentId = user._id || user.id || user.firebaseUid;
    return this.attendanceService.getTodaySessions(studentId);
  }

  @ApiOperation({
    summary: 'Sinh viên quét mã QR động để điểm danh',
    description:
      'Endpoint nhận chuỗi QR token từ camera, giải mã xác thực chữ ký HMAC, kiểm tra hạn 15–20s, ràng buộc thiết bị (chống điểm danh hộ) và vị trí GPS/Wi-Fi.',
  })
  @ApiOkResponse({ description: 'Điểm danh bằng mã QR thành công' })
  @Post('scan-qr')
  async scanQrCheckIn(
    @CurrentUser() user: any,
    @Body() dto: ScanQrDto,
    @ClientIp() clientIp: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const studentId = user._id || user.id || user.firebaseUid;
    return this.attendanceService.scanQrCheckIn(studentId, dto, clientIp, userAgent);
  }

  @ApiOperation({
    summary: 'Sinh viên tự điểm danh vào (Check-in)',
    description: 'Sinh viên thực hiện tự điểm danh vào với xác thực WiFi (Public IP) và vị trí GPS (~10-20m).',
  })
  @ApiOkResponse({ description: 'Điểm danh vào thành công' })
  @Post('check-in')
  async checkIn(
    @CurrentUser() user: any,
    @Body() dto: CheckInDto,
    @ClientIp() clientIp: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const studentId = user._id || user.id || user.firebaseUid;
    return this.attendanceService.checkIn(studentId, dto, clientIp, userAgent);
  }


  @ApiOperation({
    summary: 'Sinh viên tự điểm danh ra (Check-out)',
    description: 'Sinh viên thực hiện điểm danh ra khi buổi học kết thúc.',
  })
  @ApiOkResponse({ description: 'Điểm danh ra thành công' })
  @Post('check-out')
  async checkOut(
    @CurrentUser() user: any,
    @Body() dto: CheckInDto,
    @ClientIp() clientIp: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const studentId = user._id || user.id || user.firebaseUid;
    return this.attendanceService.checkOut(studentId, dto, clientIp, userAgent);
  }

  @ApiOperation({
    summary: 'Lấy cấu hình điểm danh hiện tại',
    description: 'Xem các thông số WiFi IP, tọa độ GPS và bán kính điểm danh hợp lệ.',
  })
  @Get('config')
  async getConfig(@ClientIp() clientIp: string) {
    const config = await this.attendanceService.getConfig();
    const configObj = (config as any).toObject ? (config as any).toObject() : config;
    return {
      ...configObj,
      currentClientIp: clientIp,
    };
  }


  @ApiOperation({
    summary: 'Cập nhật cấu hình điểm danh (Admin)',
    description: 'Cập nhật danh sách WiFi IP được phép và vị trí mốc GPS.',
  })
  @Put('config')
  async updateConfig(@Body() dto: UpdateAttendanceConfigDto) {
    return this.attendanceService.updateConfig(dto);
  }

  @ApiOperation({
    summary: 'Xem lịch sử điểm danh của bản thân',
    description: 'Lấy danh sách các lần điểm danh của sinh viên đang đăng nhập.',
  })
  @Get('my-history')
  async getMyHistory(@CurrentUser() user: any) {
    const studentId = user._id || user.id || user.firebaseUid;
    return this.attendanceService.getStudentHistory(studentId);
  }

  @ApiOperation({
    summary: 'Báo cáo điểm danh chi tiết cho Giảng viên & Admin',
    description: 'Lọc danh sách điểm danh theo Lớp học phần, Buổi học, Ngày học, Trạng thái (Đúng giờ, Đi muộn, Về sớm, Nghỉ) & Tìm kiếm sinh viên.',
  })
  @Get('report')
  async getReport(
    @Query('courseSectionId') courseSectionId?: string,
    @Query('classSessionId') classSessionId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.attendanceService.getCourseSectionReport({
      courseSectionId,
      classSessionId,
      date,
      status,
      search,
    });
  }

  @ApiOperation({
    summary: 'Lấy dữ liệu thống kê Live Check-in hiện thời của buổi học',
    description: 'Trả về số lượng sinh viên đã điểm danh, tổng sĩ số và danh sách 50 sinh viên vừa quét mã gần nhất.',
  })
  @Get('session-live-stats/:sessionId')
  async getSessionLiveStats(@Param('sessionId') sessionId: string) {
    return this.attendanceService.getSessionLiveStats(sessionId);
  }

  @ApiOperation({
    summary: 'Giảng viên / Admin điều chỉnh trạng thái điểm danh (Task 1)',
    description: 'Cho phép Giảng viên hoặc Admin điều chỉnh trạng thái (present, late, absent, excused, early_leave), ghi nhận updatedBy, lý do và lưu lịch sử Audit.',
  })
  @ApiOkResponse({ description: 'Điều chỉnh trạng thái điểm danh thành công' })
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin', 'super_admin')
  @Patch(':id/status')
  async updateAttendanceStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.attendanceService.updateAttendanceStatus(id, dto, user);
  }

  @ApiOperation({
    summary: 'Xem lịch sử điều chỉnh điểm danh (Audit History)',
    description: 'Lấy danh sách các lần chỉnh sửa điểm danh của bản ghi (ai sửa, lúc nào, lý do, trạng thái cũ -> mới).',
  })
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin', 'super_admin')
  @Get(':id/audits')
  async getAttendanceAudits(@Param('id') id: string) {
    return this.attendanceService.getAttendanceAudits(id);
  }

  @ApiOperation({
    summary: 'Tính điểm chuyên cần và kiểm tra nguy cơ cấm thi của sinh viên (Task 2)',
    description: 'Tính toán điểm chuyên cần động theo cấu hình (thang 10), tỷ lệ tham gia, tỷ lệ vắng và cờ cảnh báo cấm thi (vắng > ngưỡng cấu hình).',
  })
  @ApiOkResponse({ description: 'Điểm chuyên cần và trạng thái cảnh báo của sinh viên' })
  @Get('student/:studentId/course/:courseSectionId/score')
  async getStudentAttendanceScore(
    @Param('studentId') studentId: string,
    @Param('courseSectionId') courseSectionId: string,
    @CurrentUser() user: any,
  ) {
    return this.attendanceScoreService.calculateStudentScore(studentId, courseSectionId, user);
  }

  @ApiOperation({
    summary: 'Lấy danh sách điểm chuyên cần toàn bộ lớp học phần cho Giảng viên/Admin (Task 2)',
    description: 'Trả về bảng điểm chuyên cần của tất cả sinh viên trong lớp, danh sách sinh viên nguy cơ cấm thi và điểm trung bình.',
  })
  @ApiOkResponse({ description: 'Bảng điểm chuyên cần toàn lớp học phần' })
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin', 'super_admin')
  @Get('course/:courseSectionId/scores')
  async getClassAttendanceScores(
    @Param('courseSectionId') courseSectionId: string,
  ) {
    return this.attendanceScoreService.calculateClassScores(courseSectionId);
  }

  @ApiOperation({
    summary: 'Dự báo rủi ro chuyên cần AI cho sinh viên (Task 10)',
    description: 'Gọi mô hình Machine Learning Random Forest để đánh giá nguy cơ cấm thi sớm.',
  })
  @ApiOkResponse({ description: 'Đánh giá rủi ro AI, xác suất và khuyến nghị' })
  @Get('student/:studentId/course/:courseSectionId/risk')
  async getStudentAttendanceRisk(
    @Param('studentId') studentId: string,
    @Param('courseSectionId') courseSectionId: string,
  ) {
    return this.warningService.predictWarningForStudent(studentId, courseSectionId);
  }

  @ApiOperation({
    summary: 'Lấy danh sách đánh giá rủi ro AI toàn bộ sinh viên lớp học phần cho Giảng viên/Admin (Task 10)',
    description: 'Phân loại rủi ro (LOW, MEDIUM, HIGH), kèm xác suất và khuyến nghị AI cho cả lớp.',
  })
  @ApiOkResponse({ description: 'Danh sách rủi ro AI toàn lớp học phần' })
  @UseGuards(RolesGuard)
  @Roles('teacher', 'admin', 'super_admin')
  @Get('course/:courseSectionId/risks')
  async getClassAttendanceRisks(
    @Param('courseSectionId') courseSectionId: string,
  ) {
    return this.warningService.getClassWarnings(courseSectionId);
  }
}


