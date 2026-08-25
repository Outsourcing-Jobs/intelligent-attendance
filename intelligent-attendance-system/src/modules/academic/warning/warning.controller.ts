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
    summary: 'Dự báo nguy cơ điểm chuyên cần và đưa ra khuyến nghị thông minh',
    description:
      'Nhận student_id và course_section_id, tính toán các đặc trưng điểm danh và đưa qua mô hình học máy (ML Model) để dự báo nguy cơ bị cấm thi / chuyên cần thấp.',
  })
  @ApiOkResponse({ description: 'Kết quả dự báo và khuyến nghị từ AI' })
  @Post('predict')
  predictWarning(@Body() dto: PredictWarningDto) {
    return this.warningService.predictWarning(dto);
  }

  @ApiOperation({
    summary: 'Thống kê tình trạng cảnh báo chuyên cần toàn bộ lớp học phần',
    description: 'Trả về tổng số sinh viên ở mức nguy cơ Cao, Trung bình, Thấp trong lớp.',
  })
  @ApiParam({ name: 'courseSectionId', description: 'ObjectId của lớp học phần' })
  @ApiOkResponse({ description: 'Báo cáo tổng quan chuyên cần của lớp' })
  @Get('class-stats/:courseSectionId')
  getClassStats(@Param('courseSectionId') courseSectionId: string) {
    return this.warningService.getClassWarningStats(courseSectionId);
  }
}
