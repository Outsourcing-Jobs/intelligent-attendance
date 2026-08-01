import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  findAll() {
    return this.roleModel.find().lean();
  }

  async findById(id: string) {
    const role = await this.roleModel.findById(id).lean();
    if (!role) throw new NotFoundException('Role không tồn tại');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.roleModel.findOne({ code: dto.code });
    if (existing) throw new BadRequestException('Mã role đã tồn tại');
    return this.roleModel.create(dto);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.roleModel.findByIdAndUpdate(id, dto, { new: true });
    if (!role) throw new NotFoundException('Role không tồn tại');
    return role;
  }

  async remove(id: string) {
    const inUse = await this.userModel.exists({ roleId: id });
    if (inUse) {
      throw new BadRequestException('Không thể xóa role đang được gán cho user');
    }
    const role = await this.roleModel.findByIdAndDelete(id);
    if (!role) throw new NotFoundException('Role không tồn tại');
    return { message: 'Đã xóa role thành công' };
  }
}
