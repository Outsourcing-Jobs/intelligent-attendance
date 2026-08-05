import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DemoSeedService } from './demo-seed.service';

async function bootstrap() {
  console.log('🌱 Khởi tạo ứng dụng để thực thi demo seed...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const demoSeedService = app.get(DemoSeedService);
    console.log('🔄 Đang tạo dữ liệu demo điểm danh...');
    await demoSeedService.runDemoSeed();
    console.log('✅ Hoàn tất tạo dữ liệu demo!');
  } catch (error: any) {
    console.error('❌ Thất bại khi tạo dữ liệu demo:', error?.message || error);
    console.error(error?.stack);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
