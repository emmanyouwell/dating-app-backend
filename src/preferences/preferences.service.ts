import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Preference, PreferenceDocument } from './schema/preferences.schema';
import { UpdatePreferenceDto } from 'src/common/dto/preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectModel(Preference.name)
    private preferenceModel: Model<PreferenceDocument>,
  ) {}
  /**
   * Find preference document by userId
   * @param userId - User ObjectId from MongoDB
   * @returns Single preference object
   */
  async findByUser(userId: string): Promise<Preference> {
    const pref = await this.preferenceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
    if (!pref) throw new NotFoundException('Preferences not found');
    return pref;
  }
  /**
   * Creates default preference upon user registration
   * @param userId - User ObjectId from MongoDB
   * @returns Preference object
   */
  async createDefault(userId: string): Promise<Preference> {
    const preference = await this.preferenceModel.create({
      userId: new Types.ObjectId(userId),
    });
    if (!preference) {
      throw new HttpException('Preference not created', HttpStatus.BAD_REQUEST);
    }
    return preference;
  }
  /**
   * Updates user preference
   * @param userId - User ObjectId from MongoDB
   * @param dto Preference Update input dto
   * @returns Updated preference object
   */
  async update(userId: string, dto: UpdatePreferenceDto): Promise<Preference> {
    const updated = await this.preferenceModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: dto },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) throw new NotFoundException('Preferences not found');
    return updated;
  }
}
