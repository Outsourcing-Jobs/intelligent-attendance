import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SocketNotificationStrategy } from './strategies/socket-notification.strategy';

/**
 * WebSocket Gateway cho module Notification.
 *
 * Chức năng:
 *   1. Inject Socket.IO server instance vào SocketNotificationStrategy
 *      ngay sau khi gateway khởi tạo (afterInit).
 *   2. Cho phép client join room theo userId để nhận thông báo cá nhân.
 *   3. Log kết nối / ngắt kết nối.
 *
 * Client-side usage:
 *   const socket = io('http://localhost:3000');
 *   socket.emit('join', { userId: '...' });
 *   socket.on('notification', (data) => console.log(data));
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly socketStrategy: SocketNotificationStrategy) {}

  afterInit(server: Server): void {
    this.socketStrategy.setServer(server);
    this.logger.log('NotificationGateway initialized – Socket.IO server registered in strategy');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Client emit 'join' kèm { userId, ids } để vào room nhận thông báo.
   * Hỗ trợ join đồng thời tất cả các dạng ID (_id, id, firebaseUid) để không bao giờ lệch room.
   */
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId?: string; ids?: string[] },
    @ConnectedSocket() client: Socket,
  ): void {
    const roomsToJoin = new Set<string>();

    if (typeof data === 'string') {
      roomsToJoin.add(`user_${data}`);
    } else {
      if (data?.userId) roomsToJoin.add(`user_${data.userId}`);
      if (Array.isArray(data?.ids)) {
        data.ids.forEach((id) => {
          if (id) roomsToJoin.add(`user_${id}`);
        });
      }
    }

    roomsToJoin.forEach((room) => {
      client.join(room);
      this.logger.log(`Socket ${client.id} joined room: ${room}`);
    });

    client.emit('joined', { rooms: Array.from(roomsToJoin) });
  }

  /**
   * Client emit 'leave' để rời khỏi room.
   */
  @SubscribeMessage('leave')
  handleLeave(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = `user_${data.userId}`;
    client.leave(room);
    this.logger.log(`Socket ${client.id} left room: ${room}`);
  }
}
