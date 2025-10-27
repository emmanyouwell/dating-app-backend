import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateInterestDto } from 'src/common/dto/interests.dto';
import { Interest, InterestDocument } from './schema/interests.schema';
import { Model } from 'mongoose';

@Injectable()
export class InterestsService {
  constructor(
    @InjectModel(Interest.name) private interestModel: Model<InterestDocument>,
  ) {}
  /**
   * Create a new interest if it doesn't already exist
   * @param dto - Interest data
   * @returns The created interest or the existing one
   */
  async create(dto: CreateInterestDto): Promise<Interest> {
    const existing = await this.interestModel.findOne({ name: dto.name });
    if (existing) return existing;
    return this.interestModel.create(dto);
  }

  /**
   * Get all interests sorted by category and name
   * @returns List of interests
   */
  async findAll(): Promise<Interest[]> {
    const interests = await this.interestModel
      .find()
      .sort({ category: 1, name: 1 })
      .lean()
      .exec();

    if (!interests || interests.length === 0) {
      throw new NotFoundException('No interests found');
    }

    return interests;
  }
  /**
   * Find one interest by its ID
   * @param id - Interest ObjectId
   * @returns The interest object
   */
  async findOne(id: string): Promise<Interest> {
    const interest = await this.interestModel.findById(id).lean().exec();
    if (!interest) throw new NotFoundException('Interest not found');
    return interest;
  }

  /**
   * Delete an interest by its ID
   * @param id - Interest ObjectId
   * @throws NotFoundException if the interest does not exist
   */
  async remove(id: string): Promise<void> {
    const result = await this.interestModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Interest not found');
  }

  /**
   * Seeds interests safely (idempotent)
   */
  async seed(interests: CreateInterestDto[]): Promise<void> {
    for (const interest of interests) {
      await this.interestModel.updateOne(
        { name: interest.name },
        { $setOnInsert: interest },
        { upsert: true },
      );
    }
  }
}
