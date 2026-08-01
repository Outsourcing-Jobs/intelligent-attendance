import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';
import { UserService } from './user.service';
import { AdminUserController } from './admin-user.controller';
import { UserSelfController } from './user-self.controller';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [AdminUserController, UserSelfController],
  providers: [UserService, FirebaseAuthGuard],
  exports: [UserService],
})
export class UserModule {}
