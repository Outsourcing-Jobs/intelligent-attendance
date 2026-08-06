import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Seed24hService } from './seed-24h.service';

async function bootstrap() {
  console.log('🌱 Khởi tạo ứng dụng để thực thi seed 24H...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seed24hService = app.get(Seed24hService);
    console.log('🔄 Đang tạo dữ liệu tiết học 24H...');
    await seed24hService.runSeed24h();
    console.log('✅ Hoàn tất tạo dữ liệu tiết học 24H!');
  } catch (error: any) {
    console.error('❌ Thất bại khi tạo dữ liệu seed 24H:', error?.message || error);
    console.error(error?.stack);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
