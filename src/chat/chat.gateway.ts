// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;
  // Map of socketId -> userId
  private socketUserMap = new Map<string, string>();
  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }
    this.socketUserMap.set(client.id, userId);

    this.logger.log(`User ${userId} connected`);
  }

  handleDisconnect(client: Socket) {
    this.socketUserMap.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  @SubscribeMessage('fetch-rooms')
  async handleFetchRooms(@ConnectedSocket() client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;

    const mutualMatches = await this.chatService.getMutualMatches(userId);
    const rooms = await Promise.all(
      mutualMatches.map(async (matchId) => {
        const room = await this.chatService.getRoomName(userId, matchId);
        await client.join(room.roomName); // join room only here
        return { userId: matchId, room };
      }),
    );

    // Send the rooms back only to this client
    client.emit('rooms', rooms);
  }
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { toUserId: string; message: string },
  ) {
    this.logger.log('user sent a message');

    const fromUserId = String(this.socketUserMap.get(client.id));
    if (!fromUserId) return;
    const room = await this.chatService.getRoomName(
      fromUserId,
      payload.toUserId,
    );
    // Save message in DB
    const savedMessage = await this.chatService.saveMessage({
      from: fromUserId,
      to: payload.toUserId,
      message: payload.message,
      room: room.roomName,
    });

    // Emit to room
    this.server.to(room.roomName).emit('message', savedMessage);
  }

  /** Utility to join a room programmatically */
  async joinRoom(userId: string, matchId: string) {
    const room = await this.chatService.getRoomName(userId, matchId);

    // Find all sockets for this user
    this.server.sockets.sockets.forEach((socket) => {
      if (this.socketUserMap.get(socket.id) === userId) {
        void socket.join(room.roomName);
      }
    });
  }
  /** Expose a method for SwipeService to trigger chat unlock */
  async notifyChatUnlocked(userA: string, userB: string) {
    const room = await this.chatService.getRoomName(userA, userB);

    // Join room for both users
    await this.joinRoom(userA, userB);
    await this.joinRoom(userB, userA);

    // Emit unlock event
    this.server
      .to(room.roomName)
      .emit('chat-unlocked', { users: [userA, userB], room });
  }
}
