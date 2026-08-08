import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from '../modules/notification/schemas/notification-template.schema';
import { NotificationTemplateSeedService } from './notification-template-seed.service';

/**
 * Standalone module chỉ dùng cho seed notification templates.
 * Nhẹ, không load toàn bộ AppModule.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/base_auth_db',
      }),
    }),
    MongooseModule.forFeature([
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
    ]),
  ],
  providers: [NotificationTemplateSeedService],
})
class NotificationTemplateSeedModule {}

async function bootstrap() {
  console.log('🌱 Khởi tạo seed notification templates...');
  const app = await NestFactory.createApplicationContext(NotificationTemplateSeedModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const seedService = app.get(NotificationTemplateSeedService);
    await seedService.run();
    console.log('✅ Seed notification templates hoàn tất!');
  } catch (error: any) {
    console.error('❌ Seed thất bại:', error?.message || error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
