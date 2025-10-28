// chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from 'src/message/schema/message.schema';
import { Swipe, SwipeDocument } from 'src/swipe/schema/swipe.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Swipe.name) private swipeModel: Model<SwipeDocument>,
  ) {}

  getRoomName(userA: string, userB: string) {
    return [userA, userB].sort().join(':');
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

  async saveMessage(from: string, to: string, message: string) {
    const newMessage = new this.messageModel({
      from,
      to,
      message,
      createdAt: new Date(),
    });
    return newMessage.save();
  }
}
