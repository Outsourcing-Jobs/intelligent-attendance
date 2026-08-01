import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu, MenuDocument } from './schemas/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
  ) {}

  async getMenuForUser(permissions: string[]) {
    // If permissions includes '*', user has all permissions
    const query = permissions.includes('*')
      ? { isActive: true }
      : {
          isActive: true,
          $or: [{ permissions: { $size: 0 } }, { permissions: { $in: permissions } }],
        };

    const menus = await this.menuModel.find(query).sort({ order: 1 }).lean();
    return this.buildTree(menus);
  }

  async findAll() {
    return this.menuModel.find().sort({ order: 1 }).lean();
  }

  async create(dto: CreateMenuDto) {
    const data: any = { ...dto };
    if (dto.parentId) {
      data.parentId = new Types.ObjectId(dto.parentId);
    }
    return this.menuModel.create(data);
  }

  async update(id: string, dto: UpdateMenuDto) {
    const data: any = { ...dto };
    if (dto.parentId) {
      data.parentId = new Types.ObjectId(dto.parentId);
    }
    const updated = await this.menuModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new NotFoundException('Menu không tồn tại');
    return updated;
  }

  async remove(id: string) {
    const menu = await this.menuModel.findByIdAndDelete(id);
    if (!menu) throw new NotFoundException('Menu không tồn tại');
    return { message: 'Đã xóa menu thành công' };
  }

  private buildTree(menus: any[], parentId: string | null = null): any[] {
    return menus
      .filter((m) => String(m.parentId || '') === String(parentId || ''))
      .map((m) => ({ ...m, children: this.buildTree(menus, m._id) }));
  }
}
