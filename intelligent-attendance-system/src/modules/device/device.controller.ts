import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { DeviceService } from './device.service';
import {
  QueryDeviceDto,
  QueryLoginHistoryDto,
  RejectDeviceDto,
} from './dto/device.dto';

@ApiTags('Devices & Login History')
@ApiBearerAuth('firebase-token')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @ApiOperation({
    summary: 'Lấy danh sách thiết bị của chính sinh viên đang đăng nhập',
    description: 'Sinh viên xem các thiết bị đã đăng ký hoặc đang chờ duyệt của mình.',
  })
  @ApiOkResponse({ description: 'Lấy danh sách thành công' })
  @Get('my-devices')
  async getMyDevices(@CurrentUser() user: any) {
    return this.deviceService.getStudentDevices(user._id || user.id);
  }

  @ApiOperation({
    summary: 'Lấy danh sách thiết bị đang chờ phê duyệt (Giảng viên / Admin)',
    description: 'Giảng viên hoặc Admin xem các yêu cầu đổi thiết bị từ sinh viên.',
  })
  @Roles('admin', 'teacher')
  @Get('pending')
  async getPendingDevices(
    @Query() query: QueryDeviceDto,
    @CurrentUser() user: any,
  ) {
    return this.deviceService.getPendingDevices(query, user);
  }

  @ApiOperation({
    summary: 'Lấy danh sách thiết bị của 1 sinh viên cụ thể (Giảng viên / Admin)',
  })
  @Roles('admin', 'teacher')
  @Get('student/:studentId')
  async getStudentDevices(@Param('studentId') studentId: string) {
    return this.deviceService.getStudentDevices(studentId);
  }

  @ApiOperation({
    summary: 'Phê duyệt thiết bị mới cho sinh viên (Giảng viên / Admin)',
    description:
      'Duyệt thiết bị mới ở trạng thái pending. Thiết bị cũ của sinh viên sẽ tự động chuyển sang inactive.',
  })
  @Roles('admin', 'teacher')
  @Patch(':id/approve')
  async approveDevice(
    @Param('id') deviceRecordId: string,
    @CurrentUser() user: any,
  ) {
    return this.deviceService.approveDevice(user, deviceRecordId);
  }

  @ApiOperation({
    summary: 'Từ chối thiết bị mới của sinh viên (Giảng viên / Admin)',
  })
  @Roles('admin', 'teacher')
  @Patch(':id/reject')
  async rejectDevice(
    @Param('id') deviceRecordId: string,
    @Body() rejectDto: RejectDeviceDto,
    @CurrentUser() user: any,
  ) {
    return this.deviceService.rejectDevice(
      user,
      deviceRecordId,
      rejectDto.reason,
    );
  }

  @ApiOperation({
    summary: 'Hủy kích hoạt thiết bị của sinh viên (Giảng viên / Admin)',
  })
  @Roles('admin', 'teacher')
  @Patch(':id/deactivate')
  async deactivateDevice(
    @Param('id') deviceRecordId: string,
    @CurrentUser() user: any,
  ) {
    return this.deviceService.deactivateDevice(user, deviceRecordId);
  }

  @ApiOperation({
    summary: 'Xem lịch sử đăng nhập & đăng xuất',
    description:
      'Sinh viên xem lịch sử của chính mình. Giảng viên / Admin xem được lịch sử của toàn bộ người dùng.',
  })
  @Get('login-history')
  async getLoginHistory(
    @Query() query: QueryLoginHistoryDto,
    @CurrentUser() user: any,
  ) {
    const roleCode =
      user.roleCode ||
      user.roleId?.code ||
      user.role?.code ||
      (typeof user.role === 'string' ? user.role : '');

    const isStudent = roleCode === 'student';

    return this.deviceService.getLoginHistory(
      query,
      user._id || user.id,
      isStudent,
    );
  }
}
