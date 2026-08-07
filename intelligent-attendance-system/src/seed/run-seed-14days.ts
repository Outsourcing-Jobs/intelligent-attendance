import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Seed14DaysService } from './seed-14days.service';

async function bootstrap() {
  console.log('🌱 Khởi tạo ứng dụng để thực thi seed 14 ngày...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seed14DaysService = app.get(Seed14DaysService);
    console.log('🔄 Đang tạo dữ liệu điểm danh 14 ngày (từ 23/07/2026 đến 05/08/2026)...');
    await seed14DaysService.runSeed14Days();
    console.log('✅ Hoàn tất tạo dữ liệu seed 14 ngày!');
  } catch (error: any) {
    console.error('❌ Thất bại khi tạo dữ liệu seed 14 ngày:', error?.message || error);
    console.error(error?.stack);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
