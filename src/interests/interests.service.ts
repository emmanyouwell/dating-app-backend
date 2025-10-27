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

  async create(dto: CreateInterestDto): Promise<Interest> {
    const existing = await this.interestModel.findOne({ name: dto.name });
    if (existing) return existing;
    return this.interestModel.create(dto);
  }

  async findAll(): Promise<Interest[]> {
    return this.interestModel
      .find()
      .sort({ category: 1, name: 1 })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<Interest> {
    const interest = await this.interestModel.findById(id).lean().exec();
    if (!interest) throw new NotFoundException('Interest not found');
    return interest;
  }

  // update(id: number, updateInterestDto: UpdateInterestDto) {
  //   return `This action updates a #${id} interest`;
  // }

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
