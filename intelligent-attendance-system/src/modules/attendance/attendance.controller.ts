import {
  Body,
  Controller,
  Get,
  Headers,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ClientIp } from '../../common/decorators/client-ip.decorator';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { UpdateAttendanceConfigDto } from './dto/update-attendance-config.dto';

@ApiTags('Attendances')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard)
@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

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
}
