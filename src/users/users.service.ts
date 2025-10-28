import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from '../common/dto/user.dto';
import { EmailService } from './email.service';
import { CreateUserInput } from 'src/common/types/create-user-input.type';
import { generateVerificationCode } from 'src/common/utils/generate-verification-code';
import { CloudinaryService } from 'src/upload/cloudinary.service';
import { PreferencesService } from 'src/preferences/preferences.service';

/**
 * Users service handling user CRUD operations and business logic
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private cloudinaryService: CloudinaryService,
    private preferenceService: PreferencesService,
  ) {}

  /**
   * Create a new user
   * @param userData - User data for creation
   * @returns Created user document
   * @throws ConflictException if user with email already exists
   */
  async create(userData: CreateUserInput): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({
        email: userData.email,
      });
      if (existingUser) {
        this.logger.warn(
          `Attempted to create user with existing email: ${userData.email}`,
        );
        throw new ConflictException('User with this email already exists');
      }

      const user = new this.userModel(userData);
      const savedUser = await user.save();
      await this.emailService.sendVerificationEmail(
        user.email,
        userData.verificationCode,
      );
      this.logger.log(`User created successfully: ${userData.email}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user ${userData.email}:`, error);
      throw error;
    }
  }

  /**
   * Check if code is valid and matches the verification code
   * @param email - User email
   * @param code - Verification code
   */
  async verifyEmail(body: {
    email: string;
    code: string;
  }): Promise<{ message: string }> {
    try {
      const { email, code } = body;
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) throw new BadRequestException('User not found');

      if (user.isEmailVerified)
        throw new ConflictException('User is already verified');

      if (user?.verificationCode !== code)
        throw new BadRequestException('Invalid verification code');

      if (
        !user.verificationCodeExpiry ||
        user.verificationCodeExpiry < new Date()
      )
        throw new BadRequestException('Verification code expired');
      this.logger.log(`Code verified successfully for User: ${user.email}`);
      user.isEmailVerified = true;
      user.verificationCode = null;
      user.verificationCodeExpiry = null;
      await user.save();
      this.logger.log(`Email verified successfully for User: ${user.email}`);
      return { message: 'Email verified successfully' };
    } catch (error) {
      this.logger.error(`Error verifying code: ${error}`);
      throw error;
    }
  }

  /**
   * Send new code to user
   * @param email - User email
   * @returns Confirmation message
   */
  async sendNewCode(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.isEmailVerified) {
        throw new ConflictException('User is already verified');
      }
      const code = generateVerificationCode();
      user.verificationCode = code;
      user.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await this.emailService.sendVerificationEmail(email, code);
      this.logger.log(`New code sent to ${email} successfully`);
      return { message: 'Verification code sent successfully' };
    } catch (error) {
      this.logger.error(`Error sending new code: ${error}`);
      throw error;
    }
  }

  /**
   * Find user by email address
   * @param email - User email address
   * @returns User document or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ email }).lean().exec();
      if (user) {
        return {
          ...user,
          id: (user._id as Types.ObjectId).toHexString(),
        } as unknown as User;
      }
      this.logger.log(
        `User lookup by email: ${email} - ${user ? 'found' : 'not found'}`,
      );
      return null;
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User document or null if not found
   */
  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.userModel.findById(id).populate('interests');
      this.logger.log(
        `User lookup by ID: ${id} - ${user ? 'found' : 'not found'}`,
      );
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete user by ID
   * @param id - User ID
   * @returns True if user was deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();
      const deleted = !!result;
      this.logger.log(
        `User deletion attempt: ${id} - ${deleted ? 'successful' : 'not found'}`,
      );
      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
  /**
   * Updates the user's profile information.
   *
   * @param userId - The unique identifier of the user to update.
   * @param updateData - The payload containing updatable user fields.
   * @param file - Optional avatar image file for upload to Cloudinary.
   * @returns Updated user document.
   *
   * @throws NotFoundException if the user does not exist.
   */
  async updateProfile(
    userId: string,
    updateData: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    // Fetch user record from database
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // If avatar file is provided, upload to Cloudinary
    if (file) {
      /**
       * Uploads image to Cloudinary under `/dating-app/avatar` folder.
       * Returns both the `public_id` and `secure_url` for easy future deletion.
       */
      const uploadResult = await this.cloudinaryService.uploadImage(file.path);
      user.avatar = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }
    this.logger.log(updateData.interests);
    const result = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .populate('interests')
      .exec();

    return result as unknown as User;
  }

  /**
   * Find potential matches for the user
   * @param currentUserId string | Current user logged in
   * @returns Promise<User[] | null> | Potential candidates filtered to match the user
   */
  async findCandidates(currentUserId: string): Promise<User[] | null> {
    const currentUser = await this.userModel.findById(currentUserId).lean();
    const preferences = await this.preferenceService.findByUser(currentUserId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    if (!preferences) {
      throw new BadRequestException('Invalid User Id');
    }
    const candidates = await this.userModel
      .find({
        _id: { $ne: currentUserId }, // exclude current user
        gender: { $in: preferences.genderPreference },
        birthday: {
          $gte: new Date(
            new Date().setFullYear(
              new Date().getFullYear() - preferences.maxAge,
            ),
          ),
          $lte: new Date(
            new Date().setFullYear(
              new Date().getFullYear() - preferences.minAge,
            ),
          ),
        },
        'address.location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: currentUser?.address?.location?.coordinates,
            },
            $maxDistance: preferences.maxDistance * 1000, // convert km to meters
          },
        },
      })
      .populate('interests')
      .limit(100);

    if (!candidates) {
      throw new NotFoundException('No other candidates');
    }
    return candidates;
  }
}
