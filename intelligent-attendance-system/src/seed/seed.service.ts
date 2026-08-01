import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../modules/role/schemas/role.schema';
import { Config, ConfigDocument } from '../modules/config/schemas/config.schema';
import { Menu, MenuDocument } from '../modules/config/schemas/menu.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>,
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedConfigs();
    await this.seedMenus();
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
    const count = await this.menuModel.countDocuments();
    if (count === 0) {
      await this.menuModel.create([
        {
          name: 'Quản lý người dùng',
          url: '/users',
          icon: 'user-icon',
          order: 1,
          permissions: ['user:read'],
        },
        {
          name: 'Quản lý vai trò',
          url: '/roles',
          icon: 'role-icon',
          order: 2,
          permissions: ['role:read'],
        },
        {
          name: 'Cấu hình hệ thống',
          url: '/configs',
          icon: 'setting-icon',
          order: 3,
          permissions: ['config:read'],
        },
      ]);
      this.logger.log('Seeded default menus');
    }
  }
}
