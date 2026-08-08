import { Injectable, Inject, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from '../../../config/firebase/firebase-admin.provider';
import {
  INotificationChannel,
  NotificationPayload,
  NotificationResult,
} from '../interfaces/notification-channel.interface';

@Injectable()
export class FirebaseNotificationStrategy implements INotificationChannel {
  readonly channelName = 'firebase';
  private readonly logger = new Logger(FirebaseNotificationStrategy.name);

  constructor(@Inject(FIREBASE_ADMIN) private readonly firebaseAdmin: typeof admin) { }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const results = await Promise.allSettled(
        payload.recipientIds.map((recipientId) =>
          this.firebaseAdmin.messaging().send({
            topic: `user_${recipientId}`,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: {
              eventType: payload.eventType,
              ...(payload.data ?? {}),
            },
            android: {
              priority: 'high',
              notification: { sound: 'default' },
            },
            apns: {
              payload: { aps: { sound: 'default', badge: 1 } },
            },
          }),
        ),
      );

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
