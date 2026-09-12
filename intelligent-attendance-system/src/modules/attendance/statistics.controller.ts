import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StatisticsService } from './statistics.service';

@ApiTags('Attendance Statistics')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  private getUserId(user: any): string {
    return user._id || user.id || user.userId || user.firebaseUid;
  }

  @ApiOperation({ summary: 'Thống kê chuyên cần & KPI dành cho Sinh viên' })
  @Roles('student', 'teacher', 'lecturer', 'admin', 'super_admin')
  @Get('student')
  async getStudentStatistics(@CurrentUser() user: any, @Query('semesterId') semesterId?: string) {
    const studentId = this.getUserId(user);
    return this.statisticsService.getStudentStatistics(studentId, semesterId);
  }

  @ApiOperation({ summary: 'Thống kê chuyên cần & Xếp loại rủi ro dành cho Giảng viên' })
  @Roles('teacher', 'lecturer', 'admin', 'super_admin')
  @Get('teacher')
  async getTeacherStatistics(@CurrentUser() user: any, @Query('courseSectionId') courseSectionId?: string) {
    const teacherId = this.getUserId(user);
    return this.statisticsService.getTeacherStatistics(teacherId, courseSectionId);
  }

  @ApiOperation({ summary: 'Thống kê toàn hệ thống dành cho Quản trị viên (Admin)' })
  @Roles('admin', 'super_admin')
  @Get('admin')
  async getAdminStatistics() {
    return this.statisticsService.getAdminStatistics();
  }
}
