import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

export const SYSTEM_PERMISSIONS = [
  { id: 'users.read', label: 'Xem danh sách Người dùng', group: 'Người dùng' },
  { id: 'users.manage', label: 'Tạo, sửa & quản lý Người dùng', group: 'Người dùng' },
  { id: 'academic.read', label: 'Xem Chương trình Đào tạo & Lớp học', group: 'Đào tạo' },
  { id: 'academic.manage', label: 'Quản lý Lớp học, Môn học & Học kỳ', group: 'Đào tạo' },
  { id: 'attendance:view', label: 'Tra cứu Lịch sử Điểm danh', group: 'Điểm danh' },
  { id: 'attendance:checkin', label: 'Thực hiện Quét mặt / Điểm danh', group: 'Điểm danh' },
  { id: 'schedule:view', label: 'Xem Thời khóa biểu / Lịch học', group: 'Thời khóa biểu' },
  { id: 'leave:create', label: 'Tạo Đơn xin nghỉ học', group: 'Nghỉ học' },
  { id: 'leave:approve', label: 'Duyệt Đơn xin nghỉ học', group: 'Nghỉ học' },
  { id: 'reports.export', label: 'Xuất Báo cáo & Thống kê', group: 'Báo cáo' },
  { id: 'system.settings', label: 'Quản trị & Cấu hình Hệ thống', group: 'Hệ thống' },
];

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getSystemPermissions(): Promise<any[]> {
    return SYSTEM_PERMISSIONS;
  }

  async findAll(): Promise<any[]> {
    return this.roleModel.find().lean();
  }

  async findById(id: string): Promise<any> {
    const role = await this.roleModel.findById(id).lean();
    if (!role) throw new NotFoundException('Role không tồn tại');
    return role;
  }

  async create(dto: CreateRoleDto): Promise<any> {
    const existing = await this.roleModel.findOne({ code: dto.code });
    if (existing) throw new BadRequestException('Mã role đã tồn tại');
    return this.roleModel.create(dto);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<any> {
    const role = await this.roleModel.findByIdAndUpdate(id, dto, { new: true });
    if (!role) throw new NotFoundException('Role không tồn tại');
    return role;
  }

  async remove(id: string): Promise<any> {
    const inUse = await this.userModel.exists({ roleId: id });
    if (inUse) {
      throw new BadRequestException('Không thể xóa role đang được gán cho user');
    }
    const role = await this.roleModel.findByIdAndDelete(id);
    if (!role) throw new NotFoundException('Role không tồn tại');
    return { message: 'Đã xóa role thành công' };
  }
}
