import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Seed24hService } from './seed-24h.service';

async function bootstrap() {
  console.log('🌱 Khởi tạo ứng dụng để thực thi seed 24H / Tùy chỉnh...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const args = process.argv.slice(2);
  let customStart: string | undefined;
  let customEnd: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--start=')) customStart = arg.split('=')[1];
    else if (arg.startsWith('--end=')) customEnd = arg.split('=')[1];
    else if (arg.includes(':') && !customStart) customStart = arg;
    else if (arg.includes(':') && !customEnd) customEnd = arg;
  }

  try {
    const seed24hService = app.get(Seed24hService);
    if (customStart && customEnd) {
      console.log(`🔄 Đang tạo dữ liệu Tiết học TÙY CHỈNH từ ${customStart} đến ${customEnd}...`);
      await seed24hService.runSeedCustom(customStart, customEnd);
    } else {
      console.log('🔄 Đang tạo dữ liệu tiết học 24H phủ kín từ 00:00 đến 23:59...');
      await seed24hService.runSeed24h();
    }
    console.log('✅ Hoàn tất tạo dữ liệu tiết học!');
  } catch (error: any) {
    console.error('❌ Thất bại khi tạo dữ liệu seed:', error?.message || error);
    console.error(error?.stack);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
