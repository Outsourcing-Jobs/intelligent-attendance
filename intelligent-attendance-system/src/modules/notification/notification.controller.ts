import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@ApiTags('Notification')
@ApiBearerAuth('firebase-token')
@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ─── SEND ────────────────────────────────────────

  @Post('send')
  async send(@Body() dto: SendNotificationDto) {
    await this.notificationService.send(dto);
    return { message: 'Thông báo đã được gửi.' };
  }

  private getUserId(req: any): string {
    const user = req.user;
    if (!user) return '';
    if (user._id) return user._id.toString();
    if (user.id) return user.id.toString();
    if (user.userId) return user.userId.toString();
    return user.firebaseUid || '';
  }

  // ─── USER INBOX ──────────────────────────────────

  @Get('me')
  async getMyNotifications(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.notificationService.getNotificationsForUser(
      this.getUserId(req),
      Number(page),
      Number(limit),
    );
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Request() req: any) {
    await this.notificationService.markAsRead(id, this.getUserId(req));
    return { message: 'Đã đánh dấu đã đọc.' };
  }

  @Patch('read-all')
  async markAllRead(@Request() req: any) {
    await this.notificationService.markAllAsRead(this.getUserId(req));
    return { message: 'Tất cả thông báo đã được đánh dấu đã đọc.' };
  }

  // ─── TEMPLATE MANAGEMENT ─────────────────────────

  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.notificationService.createTemplate(dto);
  }

  @Get('templates')
  findAllTemplates() {
    return this.notificationService.findAllTemplates();
  }

  @Get('templates/:code')
  findTemplate(@Param('code') code: string) {
    return this.notificationService.findTemplateByCode(code);
  }

  @Patch('templates/:code')
  updateTemplate(@Param('code') code: string, @Body() dto: Partial<CreateTemplateDto>) {
    return this.notificationService.updateTemplate(code, dto);
  }
}
