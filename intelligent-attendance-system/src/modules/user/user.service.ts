import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';
import { User, UserDocument } from './schemas/user.schema';
import { Role, RoleDocument } from '../role/schemas/role.schema';
import { FIREBASE_ADMIN } from '../../config/firebase/firebase-admin.provider';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @Inject(FIREBASE_ADMIN) private readonly firebaseAdmin: typeof admin,
  ) {}

  async findOrCreateByFirebase(data: {
    firebaseUid: string;
    email: string;
    isEmailVerified?: boolean;
    fullName?: string;
    phone?: string;
  }) {
    let userDoc = await this.userModel.findOne({ firebaseUid: data.firebaseUid });

    if (!userDoc) {
      // Role mặc định cho user mới đăng ký
      let defaultRole = await this.roleModel.findOne({ code: 'student' });
      if (!defaultRole) {
        defaultRole = await this.roleModel.findOne();
      }

      userDoc = await this.userModel.create({
        firebaseUid: data.firebaseUid,
        email: data.email,
        isEmailVerified: data.isEmailVerified ?? false,
        fullName: data.fullName || '',
        phone: data.phone || '',
        roleId: defaultRole?._id,
      });
    } else if (data.fullName || data.phone) {
      if (data.fullName) userDoc.fullName = data.fullName;
      if (data.phone) userDoc.phone = data.phone;
      await userDoc.save();
    }

    // Cập nhật thời điểm login gần nhất
    await this.userModel.updateOne({ _id: userDoc._id }, { lastLoginAt: new Date() }).exec();

    const populatedUser = await this.userModel
      .findById(userDoc._id)
      .populate('roleId')
      .lean();

    if (!populatedUser) {
      throw new InternalServerErrorException('Không thể tìm thấy thông tin người dùng');
    }

    const roleObj = populatedUser.roleId as any;

    return {
      _id: populatedUser._id,
      id: populatedUser._id,
      firebaseUid: populatedUser.firebaseUid,
      email: populatedUser.email,
      fullName: populatedUser.fullName || '',
      avatarUrl: populatedUser.avatarUrl || '',
      avatarPublicId: populatedUser.avatarPublicId || '',
      phone: populatedUser.phone || '',
      status: populatedUser.status,
      roleCode: roleObj?.code || '',
      roleName: roleObj?.name || '',
      permissions: roleObj?.permissions || [],
      role: roleObj,
    };
  }

  async syncUserFromFirebase(data: {
    uid?: string;
    firebaseUid?: string;
    email?: string;
    name?: string;
    fullName?: string;
    phone?: string;
    picture?: string;
    email_verified?: boolean;
    isEmailVerified?: boolean;
  }) {
    const firebaseUid = data.uid || data.firebaseUid || '';
    const email = data.email || '';
    const fullName = data.name || data.fullName || '';
    const isEmailVerified = data.email_verified ?? data.isEmailVerified ?? false;

    return this.findOrCreateByFirebase({
      firebaseUid,
      email,
      fullName,
      phone: data.phone,
      isEmailVerified,
    });
  }

  async findByFirebaseUid(firebaseUid: string) {
    const user = await this.userModel.findOne({ firebaseUid }).populate('roleId').lean();
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).populate('roleId').lean();
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  async findAll(query: { page?: number; limit?: number; keyword?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.keyword) {
      filter.$or = [
        { email: { $regex: query.keyword, $options: 'i' } },
        { fullName: { $regex: query.keyword, $options: 'i' } },
        { phone: { $regex: query.keyword, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.userModel.find(filter).populate('roleId').skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createByAdmin(dto: CreateUserByAdminDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) throw new BadRequestException('Email đã tồn tại trong hệ thống');

    // 1. Tạo user trên Firebase Auth
    const firebaseUser = await this.firebaseAdmin.auth().createUser({
      email: dto.email,
      password: dto.password,
      displayName: dto.fullName,
    });

    // 2. Tìm role theo code
    const role = await this.roleModel.findOne({ code: dto.roleCode });
    if (!role) throw new BadRequestException('Role không tồn tại');

    // 3. Tạo record trong MongoDB
    const user = await this.userModel.create({
      firebaseUid: firebaseUser.uid,
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone,
      roleId: role._id,
      isEmailVerified: false,
    });

    return user;
  }

  async updateProfile(
    firebaseUid: string,
    dto: UpdateProfileDto & { avatarPublicId?: string },
  ) {
    const updated = await this.userModel.findOneAndUpdate(
      { firebaseUid },
      dto,
      { new: true },
    ).populate('roleId').lean();

    if (!updated) throw new NotFoundException('User không tồn tại');
    return updated;
  }

  async updateRole(userId: string, roleCode: string) {
    const role = await this.roleModel.findOne({ code: roleCode });
    if (!role) throw new BadRequestException('Role không tồn tại');

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { roleId: role._id },
      { new: true },
    );
    if (!user) throw new NotFoundException('User không tồn tại');

    // Force logout để quyền mới có hiệu lực
    await this.firebaseAdmin.auth().revokeRefreshTokens(user.firebaseUid);
    return user;
  }

  async banUser(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: 'banned' },
      { new: true },
    );
    if (!user) throw new NotFoundException('User không tồn tại');

    await this.firebaseAdmin.auth().revokeRefreshTokens(user.firebaseUid);
    await this.firebaseAdmin.auth().updateUser(user.firebaseUid, { disabled: true });
    return user;
  }

  async unbanUser(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: 'active' },
      { new: true },
    );
    if (!user) throw new NotFoundException('User không tồn tại');

    await this.firebaseAdmin.auth().updateUser(user.firebaseUid, { disabled: false });
    return user;
  }

  async removeUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User không tồn tại');

    try {
      await this.firebaseAdmin.auth().deleteUser(user.firebaseUid);
    } catch (e) {
      // Ignored if already deleted on firebase
    }
    await this.userModel.findByIdAndDelete(userId);
    return { message: 'Đã xóa user thành công' };
  }

  async revokeUserToken(firebaseUid: string) {
    return this.firebaseAdmin.auth().revokeRefreshTokens(firebaseUid);
  }
}
