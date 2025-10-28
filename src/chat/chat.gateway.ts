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

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
    // Join rooms for all mutual matches
    const matches = await this.chatService.getMutualMatches(userId);
    matches.forEach((matchId) => {
      const room = this.chatService.getRoomName(userId, matchId);
      void client.join(room);
    });

    console.log(`User ${userId} connected`);
  }

  handleDisconnect(client: Socket) {
    this.socketUserMap.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { toUserId: string; message: string },
  ) {
    const fromUserId = String(this.socketUserMap.get(client.id));
    if (!fromUserId) return;
    const room = this.chatService.getRoomName(fromUserId, payload.toUserId);

    // Save message in DB
    const savedMessage = await this.chatService.saveMessage(
      fromUserId,
      payload.toUserId,
      payload.message,
    );

    // Emit to room
    this.server.to(room).emit('message', savedMessage);
  }

  /** Utility to join a room programmatically */
  joinRoom(userId: string, matchId: string) {
    const room = this.chatService.getRoomName(userId, matchId);

    // Find all sockets for this user
    this.server.sockets.sockets.forEach((socket) => {
      if (this.socketUserMap.get(socket.id) === userId) {
        void socket.join(room);
      }
    });
  }
  /** Expose a method for SwipeService to trigger chat unlock */
  async notifyChatUnlocked(userA: string, userB: string) {
    const room = this.chatService.getRoomName(userA, userB);

    // Join room for both users
    await this.joinRoom(userA, userB);
    await this.joinRoom(userB, userA);

    // Emit unlock event
    this.server.to(room).emit('chat-unlocked', { users: [userA, userB], room });
  }
}
