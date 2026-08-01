import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../modules/role/schemas/role.schema';
import { Config, ConfigSchema } from '../modules/config/schemas/config.schema';
import { Menu, MenuSchema } from '../modules/config/schemas/menu.schema';
import { User, UserSchema } from '../modules/user/schemas/user.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Config.name, schema: ConfigSchema },
      { name: Menu.name, schema: MenuSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
