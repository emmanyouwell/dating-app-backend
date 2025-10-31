// chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from 'src/message/schema/message.schema';
import { Swipe, SwipeDocument } from 'src/swipe/schema/swipe.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Swipe.name) private swipeModel: Model<SwipeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getRoomName(userA: string, userB: string) {
    const fromName = await this.userModel
      .findById(userA)
      .select(['name', 'avatar.url']);
    const toName = await this.userModel
      .findById(userB)
      .select(['name', 'avatar.url']);
    const res = {
      fromName,
      toName,
      roomName: [userA, userB].sort().join(':'),
    };
    return res;
  }

  async getMutualMatches(userId: string): Promise<string[]> {
    const rightSwipes = await this.swipeModel.find({ userId, action: 'right' });
    const mutuals: string[] = [];

    for (const swipe of rightSwipes) {
      const reciprocal = await this.swipeModel.findOne({
        userId: swipe.candidateId,
        candidateId: userId,
        isMutualMatch: true,
      });
      if (reciprocal) mutuals.push(swipe.candidateId.toString());
    }
    return mutuals;
  }

  async saveMessage({
    from,
    to,
    message,
    room,
  }: {
    from: string;
    to: string;
    message: string;
    room: string;
  }) {
    const newMessage = new this.messageModel({
      from,
      to,
      message,
      room,
      createdAt: new Date(),
    });
    return newMessage.save();
  }
  /**
   * Fetch all messages of a user, grouped by mutual match
   */
  async getAllMessages(userId: string) {
    const mutualMatches = await this.getMutualMatches(userId);

    const rooms: Record<string, Message[]> = {};

    for (const matchId of mutualMatches) {
      const messages = await this.messageModel
        .find({
          $or: [
            { from: userId, to: matchId },
            { from: matchId, to: userId },
          ],
        })
        .sort({ createdAt: 1 })
        .lean();

      rooms[matchId] = messages;
    }

    return rooms; // { matchId1: [msg1, msg2], matchId2: [...] }
  }

  async getMessagesForUsers(userA: string, userB: string) {
    return this.messageModel
      .find({
        $or: [
          { from: userA, to: userB },
          { from: userB, to: userA },
        ],
      })
      .sort({ createdAt: 1 })
      .lean();
  }
}
