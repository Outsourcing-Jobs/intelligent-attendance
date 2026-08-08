import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  INotificationChannel,
  NotificationPayload,
  NotificationResult,
} from '../interfaces/notification-channel.interface';

/**
 * Concrete Strategy: Socket.IO realtime notification
 *
 * Gửi thông báo realtime qua Socket.IO đến các client đang kết nối.
 * Server Socket.IO được inject từ bên ngoài (thường qua NotificationGateway).
 *
 * Convention: mỗi user join room có tên = `user_<userId>` khi connect.
 * Strategy này emit event 'notification' vào đúng room đó.
 */
@Injectable()
export class SocketNotificationStrategy implements INotificationChannel {
  readonly channelName = 'socket';
  private readonly logger = new Logger(SocketNotificationStrategy.name);

  /** Server Socket.IO được set bởi NotificationGateway sau khi gateway khởi động */
  private socketServer: Server | null = null;

  /**
   * Được gọi bởi NotificationGateway.afterInit() để inject server instance.
   * Cần thiết vì Gateway và Strategy được khởi tạo riêng rẽ trong DI container.
   */
  setServer(server: Server): void {
    this.socketServer = server;
    this.logger.log('[Socket] Socket.IO server has been registered in strategy');
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.socketServer) {
      const msg = 'Socket.IO server chưa được khởi tạo. Hãy đảm bảo NotificationGateway đã chạy.';
      this.logger.warn(`[Socket] ${msg}`);
      return { channel: this.channelName, success: false, error: msg };
    }

    try {
      const event = {
        eventType: payload.eventType,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        sentAt: new Date().toISOString(),
      };

      const uniqueRooms = Array.from(
        new Set(payload.recipientIds.map((id) => `user_${id}`)),
      );

      uniqueRooms.forEach((room) => {
        this.socketServer!.to(room).emit('notification', event);
      });

      this.logger.log(
        `[Socket] Emitted '${payload.eventType}' to ${uniqueRooms.length} unique room(s)`,
      );

      return { channel: this.channelName, success: true };
    } catch (error) {
      this.logger.error(`[Socket] Error: ${error.message}`, error.stack);
      return { channel: this.channelName, success: false, error: error.message };
    }
  }
}
