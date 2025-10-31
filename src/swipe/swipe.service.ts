import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Swipe, SwipeDocument } from './schema/swipe.schema';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class SwipeService {
  private readonly logger = new Logger(SwipeService.name);
  constructor(
    @InjectModel(Swipe.name) private swipeModel: Model<SwipeDocument>,
    private chatGateway: ChatGateway,
  ) {}

  /**
   * Swipe right action
   * @param userId string | Current user ID
   * @param candidateId string | Candidate user ID
   * @returns Promise<Swipe>
   */
  async swipeRight(userId: string, candidateId: string): Promise<Swipe> {
    if (userId === candidateId) {
      throw new NotFoundException("You can't swipe on yourself");
    }

    // Check if user already swiped
    let swipe = await this.swipeModel.findOne({ userId, candidateId });
    if (swipe) {
      swipe.action = 'right';
    } else {
      swipe = new this.swipeModel({ userId, candidateId, action: 'right' });
    }

    // Check for mutual match
    const reciprocal = await this.swipeModel.findOne({
      userId: candidateId,
      candidateId: userId,
      action: 'right',
    });

    if (reciprocal) {
      swipe.isMutualMatch = true;
      reciprocal.isMutualMatch = true;
      await reciprocal.save();
    }

    await swipe.save();

    // Notify both users that chat is unlocked
    if (reciprocal) {
      await this.chatGateway.notifyChatUnlocked(userId, candidateId);
    }

    return swipe;
  }

  /**
   * Swipe left action
   * @param userId string | Current user ID
   * @param candidateId string | Candidate user ID
   * @returns Promise<Swipe>
   */
  async swipeLeft(userId: string, candidateId: string): Promise<Swipe> {
    if (userId === candidateId) {
      throw new NotFoundException("You can't swipe on yourself");
    }

    const swipe = new this.swipeModel({ userId, candidateId, action: 'left' });
    return swipe.save();
  }

  /**
   * Check if users can message
   * @param senderId string | Sender user ID
   * @param recipientId string | Recipient user ID
   * @returns Promise<Boolean>
   */
  async canMessage(senderId: string, recipientId: string): Promise<boolean> {
    const swipe = await this.swipeModel.findOne({
      userId: senderId,
      candidateId: recipientId,
      isMutualMatch: true,
    });
    return !!swipe;
  }

  /**
   * Get swiped candidates to filter from feed
   * @param userId string | Current user ID
   * @returns Promise<Types.ObjectId[]> | Array of users swiped/matched
   */
  async getSwipedCandidateIds(userId: string): Promise<Types.ObjectId[]> {
    return await this.swipeModel
      .find({ userId })
      .distinct('candidateId')
      .exec();
  }
  async getSwipedRightCandidateIds(userId: string): Promise<Types.ObjectId[]> {
    return await this.swipeModel
      .find({ userId, action: 'right' })
      .distinct('candidateId')
      .exec();
  }

  async unmatchCandidate(userId: string, candidateId: string) {
    // Check if user already swiped
    this.logger.log(`userID: ${userId}`);
    this.logger.log(`candidateId: ${candidateId}`);
    const swipe = await this.swipeModel.findOne({ userId, candidateId });
    if (!swipe) throw new NotFoundException('Candidate not found');
    swipe.action = 'left';
    await swipe.save();

    return swipe;
  }
}
