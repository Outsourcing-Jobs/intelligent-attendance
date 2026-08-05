import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  console.log('🌱 Khởi tạo ứng dụng để thực thi seed master data...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const connection = app.get<Connection>(getConnectionToken());
    await connection.dropDatabase();
    console.log('🗑️  Database đã được xoá sạch!');

    const seedService = app.get(SeedService);
    console.log('🔄 Đang chạy quá trình nạp dữ liệu (seed)...');
    await seedService.runSeed();
    console.log('✅ Hoàn tất seed dữ liệu thành công!');
  } catch (error: any) {
    console.error('❌ Thất bại khi seed dữ liệu:', error?.message || error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
