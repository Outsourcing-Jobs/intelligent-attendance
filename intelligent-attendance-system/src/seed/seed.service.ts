import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';
import { Role, RoleDocument } from '../modules/role/schemas/role.schema';
import { Config, ConfigDocument } from '../modules/config/schemas/config.schema';
import { Menu, MenuDocument } from '../modules/config/schemas/menu.schema';
import { User, UserDocument } from '../modules/user/schemas/user.schema';
import { FIREBASE_ADMIN } from '../config/firebase/firebase-admin.provider';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>,
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(FIREBASE_ADMIN) private firebaseAdmin: typeof admin,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedConfigs();
    await this.seedMenus();
    await this.seedUsers();
  }

  private async seedRoles() {
    const roles = [
      {
        code: 'admin',
        name: 'Quản trị viên',
        permissions: ['*'],
        description: 'Quyền quản trị toàn bộ hệ thống',
      },
      {
        code: 'teacher',
        name: 'Giáo viên',
        permissions: ['attendance:view', 'leave:approve', 'schedule:view'],
        description: 'Quyền quản lý điểm danh và xem lịch dạy',
      },
      {
        code: 'student',
        name: 'Học sinh/Sinh viên',
        permissions: ['attendance:checkin', 'leave:create', 'schedule:view'],
        description: 'Quyền xem lịch học và điểm danh cá nhân',
      },
    ];

    for (const r of roles) {
      const exists = await this.roleModel.exists({ code: r.code });
      if (!exists) {
        await this.roleModel.create(r);
        this.logger.log(`Seeded role: ${r.code}`);
      }
    }
  }

  private async seedConfigs() {
    const configs = [
      {
        key: 'SYSTEM_NAME',
        value: 'Hệ thống quản lý điểm danh',
        type: 'string',
        group: 'system',
        description: 'Tên hệ thống hiển thị',
      },
      {
        key: 'WIFI_IP_RANGE',
        value: '192.168.1.0/24',
        type: 'string',
        group: 'system',
        description: 'Dải IP wifi hợp lệ để điểm danh',
      },
    ];

    for (const c of configs) {
      const exists = await this.configModel.exists({ key: c.key });
      if (!exists) {
        await this.configModel.create(c);
        this.logger.log(`Seeded config: ${c.key}`);
      }
    }
  }

  private async seedMenus() {
    // Xóa danh mục cũ để nạp cây Menu chuẩn mới
    await this.menuModel.deleteMany({});

    await this.menuModel.create([
      {
        name: 'Bảng điều khiển',
        url: '/dashboard/default',
        icon: 'LayoutDashboard',
        order: 1,
        roles: ['admin', 'teacher', 'student'],
        permissions: ['dashboard:read'],
      },
      {
        name: 'Trang cá nhân',
        url: '/dashboard/profile',
        icon: 'CircleUser',
        order: 2,
        roles: ['admin', 'teacher', 'student'],
        permissions: ['profile:read'],
      },
      {
        name: 'Quản lý Người dùng',
        url: '/dashboard/users',
        icon: 'Users',
        order: 3,
        roles: ['admin'],
        permissions: ['users.read'],
      },
      {
        name: 'Quản lý Vai trò',
        url: '/dashboard/roles',
        icon: 'Lock',
        order: 4,
        roles: ['admin'],
        permissions: ['roles.read'],
      },
      {
        name: 'Thống kê & Báo cáo',
        url: '/dashboard/analytics',
        icon: 'Gauge',
        order: 5,
        roles: ['admin', 'teacher'],
        permissions: ['analytics.read'],
      },
      {
        name: 'Lịch học & Điểm danh',
        url: '/dashboard/calendar',
        icon: 'Calendar',
        order: 6,
        roles: ['admin', 'teacher', 'student'],
        permissions: ['calendar.read'],
      },
    ]);
    this.logger.log('Seeded default menus with frontend URLs and roles');
  }

  private async seedUsers() {
    const defaultPassword = 'Password123!';

    const seedAccounts = [
      {
        email: 'admin@school.edu.vn',
        password: defaultPassword,
        fullName: 'Quản Trị Viên Hệ Thống',
        phone: '0900000001',
        roleCode: 'admin',
      },
      {
        email: 'teacher@school.edu.vn',
        password: defaultPassword,
        fullName: 'Giảng Viên Nguyễn Văn B',
        phone: '0900000002',
        roleCode: 'teacher',
      },
      {
        email: 'student@school.edu.vn',
        password: defaultPassword,
        fullName: 'Sinh Viên Nguyễn Văn A',
        phone: '0900000003',
        roleCode: 'student',
      },
    ];

    for (const acc of seedAccounts) {
      try {
        const roleDoc = await this.roleModel.findOne({ code: acc.roleCode });
        if (!roleDoc) {
          this.logger.warn(`Role ${acc.roleCode} not found for seed user ${acc.email}`);
          continue;
        }

        let firebaseUid = '';

        // 1. Tạo hoặc lấy tài khoản từ Firebase Auth
        try {
          let fbUser: admin.auth.UserRecord;
          try {
            fbUser = await this.firebaseAdmin.auth().getUserByEmail(acc.email);
          } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
              fbUser = await this.firebaseAdmin.auth().createUser({
                email: acc.email,
                password: acc.password,
                displayName: acc.fullName,
              });
              this.logger.log(`Created Firebase Auth account: ${acc.email}`);
            } else {
              throw err;
            }
          }
          firebaseUid = fbUser.uid;
        } catch (err: any) {
          this.logger.warn(`Could not sync Firebase account for ${acc.email}: ${err.message}`);
          firebaseUid = `seed-${acc.roleCode}-uid`;
        }

        // 2. Tạo hoặc Cập nhật tài khoản trong MongoDB
        const existingUser = await this.userModel.findOne({ email: acc.email });
        if (!existingUser) {
          await this.userModel.create({
            firebaseUid,
            email: acc.email,
            fullName: acc.fullName,
            phone: acc.phone,
            roleId: roleDoc._id,
            status: 'active',
            isEmailVerified: true,
          });
          this.logger.log(`Seeded default account [${acc.roleCode.toUpperCase()}]: ${acc.email}`);
        } else {
          existingUser.roleId = roleDoc._id;
          if (firebaseUid && !existingUser.firebaseUid.startsWith('seed-')) {
            existingUser.firebaseUid = firebaseUid;
          }
          await existingUser.save();
        }
      } catch (error: any) {
        this.logger.error(`Error seeding account ${acc.email}: ${error.message}`);
      }
    }
  }
}
