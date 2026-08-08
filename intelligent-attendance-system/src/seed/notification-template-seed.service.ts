import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotificationTemplate,
  NotificationTemplateDocument,
} from '../modules/notification/schemas/notification-template.schema';
import { NOTIFICATION_TEMPLATES } from '../modules/notification/data/notification-templates.data';

/**
 * NotificationTemplateSeedService
 *
 * Đồng bộ danh sách template trong code → MongoDB.
 * Dùng upsert theo `code` nên an toàn chạy nhiều lần:
 *   - Chưa có → tạo mới
 *   - Đã có   → cập nhật nội dung (title, body, channels, …)
 *
 * Chạy: npm run seed:notifications
 */
@Injectable()
export class NotificationTemplateSeedService {
  private readonly logger = new Logger(NotificationTemplateSeedService.name);

  constructor(
    @InjectModel(NotificationTemplate.name)
    private readonly templateModel: Model<NotificationTemplateDocument>,
  ) {}

  async run(): Promise<void> {
    this.logger.log(`🔔 Bắt đầu seed ${NOTIFICATION_TEMPLATES.length} notification templates...`);

    let created = 0;
    let updated = 0;

    for (const tpl of NOTIFICATION_TEMPLATES) {
      const result = await this.templateModel.findOneAndUpdate(
        { code: tpl.code },
        {
          $set: {
            name: tpl.name,
            eventType: tpl.eventType,
            titleTemplate: tpl.titleTemplate,
            bodyTemplate: tpl.bodyTemplate,
            channels: tpl.channels,
            status: tpl.status,
            description: tpl.description,
          },
        },
        { upsert: true, new: true, rawResult: true },
      );

      if ((result as any).lastErrorObject?.updatedExisting) {
        updated++;
        this.logger.log(`  🔄 Updated: ${tpl.code}`);
      } else {
        created++;
        this.logger.log(`  ✅ Created: ${tpl.code}`);
      }
    }

    this.logger.log(
      `🎉 Hoàn tất seed templates: ${created} tạo mới, ${updated} cập nhật.`,
    );
  }
}
