import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from '../../../config/firebase/firebase-admin.provider';
import { User, UserDocument } from '../../user/schemas/user.schema';
import {
  INotificationChannel,
  NotificationPayload,
  NotificationResult,
} from '../interfaces/notification-channel.interface';

@Injectable()
export class FirebaseNotificationStrategy implements INotificationChannel {
  readonly channelName = 'firebase';
  private readonly logger = new Logger(FirebaseNotificationStrategy.name);

  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseAdmin: typeof admin,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const dispatchPromises: Promise<any>[] = [];

      for (const recipientId of payload.recipientIds) {
        const userObjId = Types.ObjectId.isValid(recipientId) ? new Types.ObjectId(recipientId) : recipientId;
        const user = await this.userModel.findOne({
          $or: [{ _id: userObjId }, { firebaseUid: recipientId }, { id: recipientId }],
        }).lean();

        const messageData = {
          eventType: payload.eventType || '',
          ...(payload.data ?? {}),
        };

        const webpushConfig = {
          headers: { Urgency: 'high' },
          notification: {
            title: payload.title,
            body: payload.body,
            icon: '/R-circle.svg',
          },
        };

        if (user?.fcmToken) {
          // Gửi trực tiếp tới thiết bị Web/Mobile qua Token duy nhất
          dispatchPromises.push(
            this.firebaseAdmin.messaging().send({
              token: user.fcmToken,
              notification: {
                title: payload.title,
                body: payload.body,
              },
              data: messageData,
              webpush: webpushConfig,
            }).catch((err) => {
              this.logger.warn(`[Firebase] Token send error for ${recipientId}: ${err?.message}`);
            }),
          );
        }

        // Đồng thời gửi theo Topic làm fallback
        dispatchPromises.push(
          this.firebaseAdmin.messaging().send({
            topic: `user_${recipientId}`,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: messageData,
            webpush: webpushConfig,
          }).catch((err) => {
            this.logger.warn(`[Firebase] Topic send error for ${recipientId}: ${err?.message}`);
          }),
        );
      }

      const results = await Promise.allSettled(dispatchPromises);
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        const errors = (failed as PromiseRejectedResult[]).map((r) => r.reason?.message).join('; ');
        this.logger.warn(`[Firebase] ${failed.length}/${results.length} failed: ${errors}`);
      }

      this.logger.log(
        `[Firebase] Sent to ${results.length - failed.length}/${results.length} recipients`,
      );

      return {
        channel: this.channelName,
        success: failed.length < results.length,
        error: failed.length > 0 ? `${failed.length} recipient(s) failed` : undefined,
      };
    } catch (error) {
      this.logger.error(`[Firebase] Critical error: ${error.message}`, error.stack);
      return { channel: this.channelName, success: false, error: error.message };
    }
  }
}
