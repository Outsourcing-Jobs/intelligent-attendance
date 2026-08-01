import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [MediaController],
})
export class MediaModule {}
