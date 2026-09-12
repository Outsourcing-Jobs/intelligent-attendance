import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { WarningService } from './warning.service';
import { PredictWarningDto } from './dto/predict-warning.dto';

@ApiTags('Attendance Warning & ML Prediction')
@ApiBearerAuth('firebase-token')
@Controller('warning')
export class WarningController {
  constructor(private readonly warningService: WarningService) {}

  @ApiOperation({
    summary: 'Dự báo nguy cơ điểm chuyên cần và đưa ra khuyến nghị thông minh (POST)',
    description:
      'Nhận student_id và course_section_id, tính toán 12 đặc trưng điểm danh và đưa qua mô hình học máy (Random Forest) để dự báo nguy cơ bị cấm thi.',
  })
  @ApiOkResponse({ description: 'Kết quả dự báo và khuyến nghị từ AI' })
  @Post('predict')
  predictWarning(@Body() dto: PredictWarningDto) {
    return this.warningService.predictWarning(dto);
  }

  @ApiOperation({
    summary: 'Lấy dự báo rủi ro chuyên cần AI của 1 sinh viên trong lớp học phần (GET)',
  })
  @ApiParam({ name: 'studentId', description: 'Mã ObjectId của sinh viên' })
  @ApiParam({ name: 'courseSectionId', description: 'Mã ObjectId của lớp học phần' })
  @ApiOkResponse({ description: 'Thông tin rủi ro, xác suất và khuyến nghị AI' })
  @Get('student/:studentId/course/:courseSectionId')
  getStudentWarning(
    @Param('studentId') studentId: string,
    @Param('courseSectionId') courseSectionId: string,
  ) {
    return this.warningService.predictWarningForStudent(studentId, courseSectionId);
  }

  @ApiOperation({
    summary: 'Lấy danh sách đánh giá rủi ro AI của toàn bộ sinh viên trong lớp học phần',
  })
  @ApiParam({ name: 'courseSectionId', description: 'Mã ObjectId của lớp học phần' })
  @ApiOkResponse({ description: 'Danh sách sinh viên kèm mức độ rủi ro, tổng hợp số lượng' })
  @Get('course/:courseSectionId')
  getCourseWarnings(@Param('courseSectionId') courseSectionId: string) {
    return this.warningService.getClassWarnings(courseSectionId);
  }

  @ApiOperation({
    summary: 'Thống kê tình trạng cảnh báo chuyên cần toàn bộ lớp học phần (Legacy)',
  })
  @ApiParam({ name: 'courseSectionId', description: 'ObjectId của lớp học phần' })
  @ApiOkResponse({ description: 'Báo cáo tổng quan chuyên cần của lớp' })
  @Get('class-stats/:courseSectionId')
  getClassStats(@Param('courseSectionId') courseSectionId: string) {
    return this.warningService.getClassWarningStats(courseSectionId);
  }
}
