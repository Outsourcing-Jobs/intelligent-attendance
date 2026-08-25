import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NOTIFICATION_TEMPLATES } from './data/notification-templates.data';
import {
  NotificationTemplate,
  NotificationTemplateDocument,
} from './schemas/notification-template.schema';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { PeriodConfig, PeriodConfigDocument } from '../config/schemas/period-config.schema';
import { ClassSession, ClassSessionDocument } from '../academic/course-section/schemas/class-session.schema';
import { Enrollment, EnrollmentDocument } from '../academic/student/schemas/enrollment.schema';
import { CourseSection, CourseSectionDocument } from '../academic/course-section/schemas/course-section.schema';
import { Subject, SubjectDocument } from '../academic/subject/schemas/subject.schema';
import {
  INotificationChannel,
  NotificationPayload,
} from './interfaces/notification-channel.interface';
import { FirebaseNotificationStrategy } from './strategies/firebase-notification.strategy';
import { SocketNotificationStrategy } from './strategies/socket-notification.strategy';
import { SendNotificationDto } from './dto/send-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';

/**
 * NotificationService – trung tâm điều phối theo Strategy Pattern.
 *
 * Flow gửi thông báo:
 *   1. Nhận SendNotificationDto (có thể kèm templateCode + variables).
 *   2. Nếu có templateCode → load template từ DB → render title/body.
 *   3. Dựa vào template.channels (hoặc mặc định cả hai) → chọn strategies.
 *   4. Gọi song song send() trên từng strategy.
 *   5. Lưu kết quả vào collection notifications.
 */
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  /** Map từ tên kênh → strategy instance */
  private readonly channelMap: Map<string, INotificationChannel>;
  private readonly notifiedSessionsSet = new Set<string>();

  constructor(
    @InjectModel(NotificationTemplate.name)
    private readonly templateModel: Model<NotificationTemplateDocument>,

    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,

    @InjectModel(PeriodConfig.name)
    private readonly periodConfigModel: Model<PeriodConfigDocument>,

    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSessionDocument>,

    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,

    @InjectModel(CourseSection.name)
    private readonly courseSectionModel: Model<CourseSectionDocument>,

    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    private readonly firebaseStrategy: FirebaseNotificationStrategy,
    private readonly socketStrategy: SocketNotificationStrategy,
  ) {
    this.channelMap = new Map<string, INotificationChannel>([
      ['firebase', this.firebaseStrategy],
      ['socket', this.socketStrategy],
    ]);
  }

  onModuleInit() {
    // Tác vụ chạy ngầm định kỳ 30s để kiểm tra và bắn thông báo khi ca học bắt đầu / nhắc trước 5 phút
    setInterval(() => {
      this.checkAndTriggerSessionNotifications().catch((err) =>
        this.logger.warn(`Auto session notification check error: ${err?.message}`),
      );
    }, 30000);
  }

  private async checkAndTriggerSessionNotifications() {
    const now = new Date();
    const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const in5Mins = new Date(now.getTime() + 5 * 60 * 1000);
    const in5MinsHHmm = `${String(in5Mins.getHours()).padStart(2, '0')}:${String(in5Mins.getMinutes()).padStart(2, '0')}`;

    const matchingPeriods = await this.periodConfigModel.find({
      startTime: { $in: [currentHHmm, in5MinsHHmm] },
      isActive: true,
    }).lean();

    if (matchingPeriods.length === 0) return;

    const periodNumbers = matchingPeriods.map((p) => p.periodNumber);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const sessions = await this.classSessionModel.find({
      date: todayStart,
      startPeriod: { $in: periodNumbers },
    }).lean();

    for (const session of sessions) {
      const sessionKey = `${session._id.toString()}_${currentHHmm}`;
      if (this.notifiedSessionsSet.has(sessionKey)) continue;

      this.notifiedSessionsSet.add(sessionKey);

      const courseSection = await this.courseSectionModel.findById(session.courseSectionId).lean();
      if (!courseSection) continue;

      const subject = await this.subjectModel.findById(courseSection.subjectId).lean();
      const courseName = subject ? subject.name : courseSection.sectionCode;

      const enrollments = await this.enrollmentModel.find({
        courseSectionId: session.courseSectionId,
        status: 'enrolled',
      }).lean();

      if (enrollments.length === 0) continue;

      const rawStudentIds = enrollments.map((e) => e.studentId);
      const studentUsers = await this.userModel.find({
        _id: { $in: rawStudentIds },
        roleCode: { $nin: ['admin', 'teacher', 'lecturer'] },
      }).select('_id').lean();

      if (studentUsers.length === 0) continue;

      const studentIds = studentUsers.map((u) => u._id.toString());
      const periodCfg = matchingPeriods.find((p) => p.periodNumber === session.startPeriod);

      this.logger.log(
        `⏰ [AutoScheduler] Auto-dispatched session start notification for '${courseName}' (${studentIds.length} students)`,
      );

      await this.send({
        recipientIds: studentIds,
        templateCode: 'attendance.session_started',
        variables: {
          courseName,
          deadline: periodCfg ? periodCfg.startTime : currentHHmm,
        },
        eventType: 'attendance.session_started',
      });
    }
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────

  /**
   * Gửi thông báo theo một nghiệp vụ, tự động dùng cả 2 kênh
   * (Firebase + Socket) hoặc kênh do template quy định.
   */
  async send(dto: SendNotificationDto): Promise<void> {
    const rawRecipientIds = dto.recipientIds || [];
    const recipientIds = Array.from(new Set(rawRecipientIds.map(String)));
    const { templateCode, title, body, eventType, data } = dto;

    let resolvedTitle = title ?? '';
    let resolvedBody = body ?? '';
    let channels: string[] = ['firebase', 'socket'];
    let templateId: Types.ObjectId | null = null;

    // ── Render từ template nếu có ──────────────
    if (templateCode) {
      // 1. Kiểm tra trong Code Constant trước (Memory/RAM - Không tốn DB query)
      let template: {
        _id?: Types.ObjectId;
        titleTemplate: string;
        bodyTemplate: string;
        channels?: string[];
      } | null = NOTIFICATION_TEMPLATES.find(
        (t) => t.code === templateCode && t.status === 'active',
      ) ?? null;

      // 2. Nếu trong Code không có -> mới query DB (đối với template được tạo động qua API)
      if (!template) {
        const dbTemplate = await this.templateModel.findOne({
          code: templateCode,
          status: 'active',
        });
        if (dbTemplate) {
          template = {
            _id: dbTemplate._id as Types.ObjectId,
            titleTemplate: dbTemplate.titleTemplate,
            bodyTemplate: dbTemplate.bodyTemplate,
            channels: dbTemplate.channels,
          };
        }
      }

      if (!template) {
        throw new NotFoundException(`Template '${templateCode}' không tồn tại hoặc đã bị vô hiệu.`);
      }

      resolvedTitle = this.renderTemplate(template.titleTemplate, dto.variables ?? {});
      resolvedBody = this.renderTemplate(template.bodyTemplate, dto.variables ?? {});
      channels = template.channels ?? channels;
      templateId = template._id ?? null;
    } else if (!title || !body) {
      throw new BadRequestException('Phải cung cấp templateCode hoặc cả title lẫn body.');
    }

    const payload: NotificationPayload = {
      recipientIds,
      title: resolvedTitle,
      body: resolvedBody,
      eventType,
      data,
    };

    // ── 1. Phát Socket.IO ngay lập tức (Instant 0ms emission) ──────────
    let socketResult: { channel: string; success: boolean; error?: string } = { channel: 'socket', success: false };
    if (channels.includes('socket')) {
      try {
        socketResult = await this.socketStrategy.send(payload);
      } catch (err: any) {
        this.logger.warn(`[Socket] Emission error: ${err?.message}`);
      }
    }

    // ── 2. Phát Firebase FCM & Lưu DB ngầm (Non-blocking / Background) ──
    const processFirebaseAndSave = async () => {
      let firebaseResult: { channel: string; success: boolean; error?: string } = { channel: 'firebase', success: false };
      if (channels.includes('firebase')) {
        try {
          firebaseResult = await this.firebaseStrategy.send(payload);
        } catch (err: any) {
          firebaseResult = { channel: 'firebase', success: false, error: err?.message };
        }
      }

      const deliveryResults: Record<string, { success: boolean; error?: string }> = {
        socket: { success: socketResult.success },
        firebase: { success: firebaseResult.success, error: firebaseResult.error },
      };

      await Promise.all(
        recipientIds.map((recipientId) => {
          const recObjId = Types.ObjectId.isValid(recipientId)
            ? new Types.ObjectId(recipientId)
            : recipientId;
          return this.notificationModel.create({
            recipientId: recObjId,
            templateId,
            eventType,
            title: resolvedTitle,
            body: resolvedBody,
            data: data ?? {},
            channelsSent: channels,
            deliveryResults,
          });
        }),
      );
    };

    // Chạy ngầm Firebase + DB write để không block HTTP request
    processFirebaseAndSave().catch((err) =>
      this.logger.error(`[NotificationService] Background dispatch error: ${err?.message}`),
    );

    this.logger.log(
      `[NotificationService] Instantly dispatched '${eventType}' → ${recipientIds.length} recipient(s)`,
    );

    this.logger.log(
      `[NotificationService] Sent '${eventType}' → ${recipientIds.length} recipients via [${channels.join(', ')}]`,
    );
  }

  // ─────────────────────────────────────────────
  // TEMPLATE CRUD
  // ─────────────────────────────────────────────

  async createTemplate(dto: CreateTemplateDto): Promise<NotificationTemplate> {
    return this.templateModel.create(dto);
  }

  async findAllTemplates(): Promise<NotificationTemplate[]> {
    return this.templateModel.find().sort({ createdAt: -1 }).lean();
  }

  async findTemplateByCode(code: string): Promise<NotificationTemplate> {
    const template = await this.templateModel.findOne({ code }).lean();
    if (!template) throw new NotFoundException(`Template '${code}' không tồn tại.`);
    return template;
  }

  async updateTemplate(
    code: string,
    dto: Partial<CreateTemplateDto>,
  ): Promise<NotificationTemplate> {
    const template = await this.templateModel.findOneAndUpdate({ code }, dto, { new: true });
    if (!template) throw new NotFoundException(`Template '${code}' không tồn tại.`);
    return template;
  }

  // ─────────────────────────────────────────────
  // NOTIFICATION QUERIES
  // ─────────────────────────────────────────────

  async getNotificationsForUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Notification[]; total: number; unread: number }> {
    if (!userId) return { data: [], total: 0, unread: 0 };
    const userObjId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const filter = {
      $or: [{ recipientId: userObjId }, { recipientId: userId }],
    };
    const [data, total, unread] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({ ...filter, isRead: false }),
    ]);
    return { data, total, unread };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    if (!notificationId || notificationId.startsWith('rt_')) {
      return; // Bỏ qua notificationId tạm thời tạo ở frontend khi nhận realtime
    }
    if (!Types.ObjectId.isValid(notificationId)) {
      return;
    }
    const notiObjId = new Types.ObjectId(notificationId);
    const userObjId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;

    await this.notificationModel.updateOne(
      {
        _id: notiObjId,
        $or: [{ recipientId: userObjId }, { recipientId: userId }],
      },
      { isRead: true, readAt: new Date() },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    if (!userId) return;
    const userObjId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    await this.notificationModel.updateMany(
      {
        $or: [{ recipientId: userObjId }, { recipientId: userId }],
        isRead: false,
      },
      { isRead: true, readAt: new Date() },
    );
  }

  // ─────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────

  /**
   * Render template string: thay thế {{key}} bằng giá trị từ variables.
   * Ví dụ: "Xin chào {{name}}!" với { name: 'An' } → "Xin chào An!"
   */
  private renderTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
  }
}
