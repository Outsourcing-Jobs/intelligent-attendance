import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDevice, UserDeviceDocument } from './schemas/user-device.schema';
import { LoginHistory, LoginHistoryDocument } from './schemas/login-history.schema';
import { DeviceInfoDto, QueryDeviceDto, QueryLoginHistoryDto } from './dto/device.dto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectModel(UserDevice.name) private userDeviceModel: Model<UserDeviceDocument>,
    @InjectModel(LoginHistory.name) private loginHistoryModel: Model<LoginHistoryDocument>,
  ) {}

  /**
   * Kiểm tra & Đăng ký thiết bị khi đăng nhập
   */
  async validateAndRegisterDevice(
    userId: string | Types.ObjectId,
    roleCode: string,
    deviceInfo: DeviceInfoDto,
  ): Promise<{ allowed: boolean; status: string; message: string; device: UserDeviceDocument }> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const { deviceId, deviceName, deviceType, os, browser, userAgent } = deviceInfo;

    const formattedDeviceId = deviceId || 'unknown-device-id';
    const formattedDeviceName = deviceName || 'Trình duyệt Web';

    // 1. Nếu không phải sinh viên (VD: giảng viên, admin), luôn cho phép và tự động duy trì thiết bị
    if (roleCode !== 'student') {
      let device = await this.userDeviceModel.findOne({
        userId: userObjId,
        deviceId: formattedDeviceId,
      });

      if (!device) {
        device = await this.userDeviceModel.create({
          userId: userObjId,
          deviceId: formattedDeviceId,
          deviceName: formattedDeviceName,
          deviceType: deviceType || 'web',
          os,
          browser,
          userAgent,
          status: 'approved',
          approvedAt: new Date(),
          lastActiveAt: new Date(),
        });
      } else {
        device.lastActiveAt = new Date();
        if (device.status !== 'approved') {
          device.status = 'approved';
        }
        await device.save();
      }

      return {
        allowed: true,
        status: 'approved',
        message: 'Xác thực thiết bị thành công',
        device,
      };
    }

    // 2. Xử lý cho Sinh viên (roleCode === 'student')
    // Tìm các thiết bị đã được Duyệt (approved) của sinh viên này
    const approvedDevices = await this.userDeviceModel.find({
      userId: userObjId,
      status: 'approved',
    });

    // Trường hợp A: Sinh viên CHƯA CÓ thiết bị nào được duyệt (Lần đầu sử dụng)
    if (approvedDevices.length === 0) {
      let firstDevice = await this.userDeviceModel.findOne({
        userId: userObjId,
        deviceId: formattedDeviceId,
      });

      if (!firstDevice) {
        firstDevice = await this.userDeviceModel.create({
          userId: userObjId,
          deviceId: formattedDeviceId,
          deviceName: formattedDeviceName,
          deviceType: deviceType || 'web',
          os,
          browser,
          userAgent,
          status: 'approved',
          approvedAt: new Date(),
          lastActiveAt: new Date(),
        });
      } else {
        firstDevice.status = 'approved';
        firstDevice.approvedAt = new Date();
        firstDevice.lastActiveAt = new Date();
        await firstDevice.save();
      }

      return {
        allowed: true,
        status: 'approved',
        message: 'Thiết bị đầu tiên của bạn đã được tự động đăng ký và kích hoạt',
        device: firstDevice,
      };
    }

    // Trường hợp B: Đã có thiết bị approved trước đó
    const isCurrentDeviceApproved = approvedDevices.some(
      (d) => d.deviceId === formattedDeviceId,
    );

    if (isCurrentDeviceApproved) {
      const activeDevice = approvedDevices.find((d) => d.deviceId === formattedDeviceId)!;
      activeDevice.lastActiveAt = new Date();
      await activeDevice.save();

      return {
        allowed: true,
        status: 'approved',
        message: 'Xác thực thiết bị thành công',
        device: activeDevice,
      };
    }

    // Trường hợp C: Đăng nhập từ thiết bị KHÁC (khác deviceId đã duyệt)
    let pendingDevice = await this.userDeviceModel.findOne({
      userId: userObjId,
      deviceId: formattedDeviceId,
    });

    if (!pendingDevice) {
      pendingDevice = await this.userDeviceModel.create({
        userId: userObjId,
        deviceId: formattedDeviceId,
        deviceName: formattedDeviceName,
        deviceType: deviceType || 'web',
        os,
        browser,
        userAgent,
        status: 'pending',
        requestedAt: new Date(),
        lastActiveAt: new Date(),
      });
    } else {
      if (pendingDevice.status !== 'approved') {
        pendingDevice.status = 'pending';
        pendingDevice.requestedAt = new Date();
        pendingDevice.lastActiveAt = new Date();
        await pendingDevice.save();
      }
    }

    return {
      allowed: false,
      status: pendingDevice.status,
      message:
        pendingDevice.status === 'rejected'
          ? `Thiết bị này đã bị từ chối (${pendingDevice.rejectionReason || 'Không rõ lý do'}). Vui lòng liên hệ giảng viên.`
          : 'Bạn đang đăng nhập trên thiết bị mới. Vui lòng chờ Giảng viên/Admin phê duyệt đổi máy.',
      device: pendingDevice,
    };
  }

  /**
   * Giảng viên / Admin duyệt thiết bị mới cho sinh viên
   */
  async approveDevice(approverId: string, deviceRecordId: string) {
    const targetDevice = await this.userDeviceModel.findById(deviceRecordId);
    if (!targetDevice) {
      throw new NotFoundException('Không tìm thấy bản ghi thiết bị');
    }

    // Chuyển toàn bộ các thiết bị cũ của sinh viên này sang trạng thái inactive
    await this.userDeviceModel.updateMany(
      {
        userId: targetDevice.userId,
        _id: { $ne: targetDevice._id },
        status: 'approved',
      },
      {
        $set: { status: 'inactive' },
      },
    );

    // Kích hoạt thiết bị mới
    targetDevice.status = 'approved';
    targetDevice.approvedAt = new Date();
    targetDevice.approvedBy = new Types.ObjectId(approverId);
    targetDevice.rejectionReason = undefined;
    targetDevice.lastActiveAt = new Date();
    await targetDevice.save();

    return {
      message: 'Đã phê duyệt thiết bị mới thành công',
      device: targetDevice,
    };
  }

  /**
   * Giảng viên / Admin từ chối thiết bị mới
   */
  async rejectDevice(approverId: string, deviceRecordId: string, reason?: string) {
    const targetDevice = await this.userDeviceModel.findById(deviceRecordId);
    if (!targetDevice) {
      throw new NotFoundException('Không tìm thấy bản ghi thiết bị');
    }

    targetDevice.status = 'rejected';
    targetDevice.approvedBy = new Types.ObjectId(approverId);
    targetDevice.rejectionReason = reason || 'Từ chối bởi Giảng viên/Quản trị viên';
    await targetDevice.save();

    return {
      message: 'Đã từ chối thiết bị',
      device: targetDevice,
    };
  }

  /**
   * Lấy danh sách thiết bị chờ duyệt (cho Giảng viên/Admin)
   */
  async getPendingDevices(query: QueryDeviceDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter: any = { status: query.status || 'pending' };

    const [items, total] = await Promise.all([
      this.userDeviceModel
        .find(filter)
        .populate('userId', 'fullName email userCode phone avatarUrl')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userDeviceModel.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy danh sách thiết bị của một sinh viên
   */
  async getStudentDevices(studentId: string) {
    return this.userDeviceModel
      .find({ userId: new Types.ObjectId(studentId) })
      .populate('approvedBy', 'fullName email')
      .sort({ updatedAt: -1 })
      .exec();
  }

  /**
   * Ghi log lịch sử đăng nhập
   */
  async recordLoginHistory(params: {
    userId: string | Types.ObjectId;
    userEmail: string;
    userFullName: string;
    roleCode: string;
    deviceId: string;
    deviceName?: string;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'pending_device' | 'rejected_device' | 'failed' | 'logged_out';
    message?: string;
  }) {
    try {
      await this.loginHistoryModel.create({
        userId: new Types.ObjectId(params.userId),
        userEmail: params.userEmail,
        userFullName: params.userFullName,
        roleCode: params.roleCode,
        deviceId: params.deviceId || 'unknown',
        deviceName: params.deviceName || 'Trình duyệt Web',
        ipAddress: params.ipAddress || '0.0.0.0',
        userAgent: params.userAgent || '',
        status: params.status,
        message: params.message,
        loginAt: new Date(),
      });
    } catch (err: any) {
      this.logger.error(`Lỗi khi ghi lịch sử đăng nhập: ${err.message}`);
    }
  }

  /**
   * Ghi log đăng xuất
   */
  async recordLogoutHistory(userId: string | Types.ObjectId, deviceId?: string) {
    try {
      const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

      // Tìm bản ghi đăng nhập gần nhất chưa đăng xuất
      const filter: any = { userId: userObjId, status: 'success' };
      if (deviceId) filter.deviceId = deviceId;

      const latestLog = await this.loginHistoryModel.findOne(filter).sort({ loginAt: -1 });

      if (latestLog && !latestLog.logoutAt) {
        latestLog.logoutAt = new Date();
        await latestLog.save();
      }

      // Tạo thêm 1 bản ghi sự kiện logged_out
      await this.loginHistoryModel.create({
        userId: userObjId,
        userEmail: latestLog?.userEmail || '',
        userFullName: latestLog?.userFullName || '',
        roleCode: latestLog?.roleCode || '',
        deviceId: deviceId || latestLog?.deviceId || 'unknown',
        deviceName: latestLog?.deviceName || 'Trình duyệt Web',
        ipAddress: latestLog?.ipAddress || '0.0.0.0',
        userAgent: latestLog?.userAgent || '',
        status: 'logged_out',
        message: 'Người dùng đã đăng xuất',
        loginAt: new Date(),
        logoutAt: new Date(),
      });
    } catch (err: any) {
      this.logger.error(`Lỗi khi ghi nhật ký đăng xuất: ${err.message}`);
    }
  }

  /**
   * Truy vấn nhật ký đăng nhập
   */
  async getLoginHistory(query: QueryLoginHistoryDto, currentUserId?: string, isStudent?: boolean) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (isStudent && currentUserId) {
      filter.userId = new Types.ObjectId(currentUserId);
    } else if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.loginHistoryModel
        .find(filter)
        .populate('userId', 'fullName email userCode avatarUrl')
        .sort({ loginAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.loginHistoryModel.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
