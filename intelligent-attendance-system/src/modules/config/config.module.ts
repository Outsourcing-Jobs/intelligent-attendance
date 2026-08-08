import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from './schemas/config.schema';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { ConfigService } from './config.service';
import { MenuService } from './menu.service';
import { ConfigController } from './config.controller';
import { MenuController } from './menu.controller';
import { UserModule } from '../user/user.module';

import { PeriodConfig, PeriodConfigSchema } from './schemas/period-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      { name: Menu.name, schema: MenuSchema },
      { name: PeriodConfig.name, schema: PeriodConfigSchema },
    ]),
    UserModule,
  ],
  controllers: [ConfigController, MenuController],
  providers: [ConfigService, MenuService],
  exports: [ConfigService, MenuService],
})
export class ConfigModule {}
