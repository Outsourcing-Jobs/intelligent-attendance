import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDevice, UserDeviceDocument } from './schemas/user-device.schema';
import { LoginHistory, LoginHistoryDocument } from './schemas/login-history.schema';
import { StudentClass, ClassDocument } from '../academic/class/schemas/class.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { DeviceInfoDto, QueryDeviceDto, QueryLoginHistoryDto } from './dto/device.dto';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectModel(UserDevice.name) private userDeviceModel: Model<UserDeviceDocument>,
    @InjectModel(LoginHistory.name) private loginHistoryModel: Model<LoginHistoryDocument>,
    @InjectModel(StudentClass.name) private studentClassModel: Model<ClassDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationService: NotificationService,
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

    if (!deviceId || !deviceId.trim()) {
      throw new BadRequestException('Vui lòng cung cấp mã định danh thiết bị (deviceId)');
    }

    const formattedDeviceId = deviceId.trim();
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

    // 🔔 Gửi thông báo tới Giảng viên Chủ nhiệm (hoặc Admin nếu không có GVCN) để xét duyệt
    try {
      const recipientIds: string[] = [];
      const student = await this.userModel.findById(userObjId).lean();
      if (student && student.classId) {
        const studentClass = await this.studentClassModel.findById(student.classId).lean();
        if (studentClass && studentClass.homeroomLecturerId) {
          recipientIds.push(studentClass.homeroomLecturerId.toString());
        }
      }

      // Nếu sinh viên chưa có GVCN, thông báo cho tất cả Admin
      if (recipientIds.length === 0) {
        const adminUsers = await this.userModel.find({ roleCode: 'admin' }).select('_id').lean();
        adminUsers.forEach((a) => recipientIds.push(a._id.toString()));
      }

      if (recipientIds.length > 0) {
        await this.notificationService.send({
          recipientIds,
          templateCode: 'device_change.requested',
          variables: {
            studentName: student?.fullName || 'Sinh viên',
            userCode: student?.userCode || 'N/A',
            deviceName: formattedDeviceName,
          },
          eventType: 'device_change.requested',
        });
      }
    } catch (err: any) {
      this.logger.warn(`Failed to send device_change.requested notification: ${err?.message}`);
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
  async approveDevice(approverUser: any, deviceRecordId: string) {
    const targetDevice = await this.userDeviceModel.findById(deviceRecordId);
    if (!targetDevice) {
      throw new NotFoundException('Không tìm thấy bản ghi thiết bị');
    }

    const approverId = typeof approverUser === 'object' ? (approverUser._id || approverUser.id) : approverUser;
    const roleCode =
      typeof approverUser === 'object'
        ? (approverUser.roleCode || approverUser.roleId?.code || approverUser.role?.code || (typeof approverUser.role === 'string' ? approverUser.role : 'teacher'))
        : 'teacher';

    // Ràng buộc đối với Giảng viên (Không phải Admin): Chỉ được duyệt sinh viên thuộc lớp Chủ nhiệm
    if (roleCode === 'teacher' && approverId) {
      const student = await this.userModel.findById(targetDevice.userId);
      if (!student || !student.classId) {
        throw new ForbiddenException('Sinh viên này chưa thuộc lớp học nào hoặc bạn không có quyền duyệt.');
      }

      const studentClass = await this.studentClassModel.findById(student.classId);
      if (!studentClass || String(studentClass.homeroomLecturerId) !== String(approverId)) {
        throw new ForbiddenException('Bạn chỉ có quyền phê duyệt thiết bị cho sinh viên thuộc lớp bạn làm Chủ nhiệm.');
      }
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

    // 🔔 Gửi thông báo tới Sinh viên qua NotificationService
    try {
      await this.notificationService.send({
        recipientIds: [targetDevice.userId.toString()],
        templateCode: 'device_change.approved',
        variables: { deviceName: targetDevice.deviceName || 'Mới' },
        eventType: 'device_change.approved',
      });
    } catch (err: any) {
      this.logger.warn(`Failed to send approve device notification: ${err?.message}`);
    }

    return {
      message: 'Đã phê duyệt thiết bị mới thành công',
      device: targetDevice,
    };
  }

  /**
   * Giảng viên / Admin từ chối thiết bị mới
   */
  async rejectDevice(approverUser: any, deviceRecordId: string, reason?: string) {
    const targetDevice = await this.userDeviceModel.findById(deviceRecordId);
    if (!targetDevice) {
      throw new NotFoundException('Không tìm thấy bản ghi thiết bị');
    }

    const approverId = typeof approverUser === 'object' ? (approverUser._id || approverUser.id) : approverUser;
    const roleCode =
      typeof approverUser === 'object'
        ? (approverUser.roleCode || approverUser.roleId?.code || approverUser.role?.code || (typeof approverUser.role === 'string' ? approverUser.role : 'teacher'))
        : 'teacher';

    // Ràng buộc đối với Giảng viên Chủ nhiệm
    if (roleCode === 'teacher' && approverId) {
      const student = await this.userModel.findById(targetDevice.userId);
      if (!student || !student.classId) {
        throw new ForbiddenException('Sinh viên này chưa thuộc lớp học nào hoặc bạn không có quyền từ chối.');
      }

      const studentClass = await this.studentClassModel.findById(student.classId);
      if (!studentClass || String(studentClass.homeroomLecturerId) !== String(approverId)) {
        throw new ForbiddenException('Bạn chỉ có quyền từ chối thiết bị cho sinh viên thuộc lớp bạn làm Chủ nhiệm.');
      }
    }

    targetDevice.status = 'rejected';
    targetDevice.approvedBy = new Types.ObjectId(approverId);
    targetDevice.rejectionReason = reason || 'Từ chối bởi Giảng viên Chủ nhiệm/Quản trị viên';
    await targetDevice.save();

    // 🔔 Gửi thông báo tới Sinh viên qua NotificationService
    try {
      await this.notificationService.send({
        recipientIds: [targetDevice.userId.toString()],
        templateCode: 'device_change.rejected',
        variables: { reason: targetDevice.rejectionReason },
        eventType: 'device_change.rejected',
      });
    } catch (err: any) {
      this.logger.warn(`Failed to send reject device notification: ${err?.message}`);
    }

    return {
      message: 'Đã từ chối thiết bị',
      device: targetDevice,
    };
  }

  /**
   * Giảng viên / Admin hủy kích hoạt thiết bị của sinh viên
   */
  async deactivateDevice(approverUser: any, deviceRecordId: string) {
    const targetDevice = await this.userDeviceModel.findById(deviceRecordId);
    if (!targetDevice) {
      throw new NotFoundException('Không tìm thấy bản ghi thiết bị');
    }

    const approverId = typeof approverUser === 'object' ? (approverUser._id || approverUser.id) : approverUser;
    const roleCode =
      typeof approverUser === 'object'
        ? (approverUser.roleCode || approverUser.roleId?.code || approverUser.role?.code || (typeof approverUser.role === 'string' ? approverUser.role : 'teacher'))
        : 'teacher';

    if (roleCode === 'teacher' && approverId) {
      const student = await this.userModel.findById(targetDevice.userId);
      if (!student || !student.classId) {
        throw new ForbiddenException('Sinh viên này chưa thuộc lớp học nào hoặc bạn không có quyền hủy thiết bị.');
      }

      const studentClass = await this.studentClassModel.findById(student.classId);
      if (!studentClass || String(studentClass.homeroomLecturerId) !== String(approverId)) {
        throw new ForbiddenException('Bạn chỉ có quyền quản lý thiết bị cho sinh viên thuộc lớp bạn làm Chủ nhiệm.');
      }
    }

    targetDevice.status = 'inactive';
    await targetDevice.save();

    return {
      message: 'Đã hủy kích hoạt thiết bị thành công',
      device: targetDevice,
    };
  }

  /**
   * Lấy danh sách thiết bị chờ duyệt (Giảng viên Chủ nhiệm / Admin)
   */
  async getPendingDevices(query: QueryDeviceDto, currentUser?: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter: any = { status: query.status || 'pending' };

    const roleCode =
      typeof currentUser === 'object'
        ? (currentUser.roleCode || currentUser.roleId?.code || currentUser.role?.code || (typeof currentUser.role === 'string' ? currentUser.role : ''))
        : '';
    const currentUserId = typeof currentUser === 'object' ? (currentUser._id || currentUser.id) : currentUser;

    // Nếu là Giảng viên Chủ nhiệm (không phải Admin), chỉ lọc thiết bị thuộc lớp mình chủ nhiệm
    if (roleCode === 'teacher' && currentUserId) {
      // 1. Tìm các lớp mà giảng viên này làm GVCN
      const myHomeroomClasses = await this.studentClassModel.find({
        homeroomLecturerId: new Types.ObjectId(currentUserId),
      }).select('_id');

      const classIds = myHomeroomClasses.map((c) => c._id);

      // 2. Tìm tất cả sinh viên thuộc các lớp đó
      const myStudents = await this.userModel.find({
        classId: { $in: classIds },
      }).select('_id');

      const studentUserIds = myStudents.map((s) => s._id);

      // 3. Đặt điều kiện filter theo danh sách sinh viên lớp mình
      filter.userId = { $in: studentUserIds };
    }

    const [items, total] = await Promise.all([
      this.userDeviceModel
        .find(filter)
        .populate({
          path: 'userId',
          select: 'fullName email userCode phone avatarUrl classId',
          populate: {
            path: 'classId',
            select: 'name cohortYear',
          },
        })
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
   * Lấy danh sách thiết bị của một sinh viên (Hỗ trợ tra cứu theo MSSV userCode, Email, hoặc MongoDB _id)
   */
  async getStudentDevices(identifier: string) {
    if (!identifier || !identifier.trim()) return [];

    const searchStr = identifier.trim();
    let targetUserId: Types.ObjectId | null = null;

    // 1. Thử tìm theo MSSV (userCode) hoặc Email trước
    const user = await this.userModel.findOne({
      $or: [
        { userCode: searchStr },
        { email: searchStr.toLowerCase() },
      ],
    });

    if (user) {
      targetUserId = user._id as Types.ObjectId;
    } else if (Types.ObjectId.isValid(searchStr)) {
      // 2. Nếu không tìm thấy theo userCode/Email và chuỗi là ObjectId hợp lệ
      targetUserId = new Types.ObjectId(searchStr);
    }

    if (!targetUserId) {
      return [];
    }

    return this.userDeviceModel
      .find({ userId: targetUserId })
      .populate('userId', 'fullName email userCode phone')
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
