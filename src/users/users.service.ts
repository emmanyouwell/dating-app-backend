import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from '../common/dto/user.dto';
import { RegisterDto } from '../common/dto/auth.dto';

/**
 * Users service handling user CRUD operations and business logic
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Create a new user
   * @param userData - User data for creation
   * @returns Created user document
   * @throws ConflictException if user with email already exists
   */
  async create(userData: RegisterDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({ email: userData.email });
      if (existingUser) {
        this.logger.warn(`Attempted to create user with existing email: ${userData.email}`);
        throw new ConflictException('User with this email already exists');
      }

      const user = new this.userModel(userData);
      const savedUser = await user.save();
      this.logger.log(`User created successfully: ${userData.email}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user ${userData.email}:`, error);
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
      const user = await this.userModel.findOne({ email }).exec();
      this.logger.log(`User lookup by email: ${email} - ${user ? 'found' : 'not found'}`);
      return user;
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
      const user = await this.userModel.findById(id).exec();
      this.logger.log(`User lookup by ID: ${id} - ${user ? 'found' : 'not found'}`);
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update user data
   * @param id - User ID
   * @param updateData - Data to update
   * @returns Updated user document or null if not found
   * @throws NotFoundException if user not found
   */
  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
      if (!user) {
        this.logger.warn(`Attempted to update non-existent user: ${id}`);
        throw new NotFoundException('User not found');
      }
      this.logger.log(`User updated successfully: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error);
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
      this.logger.log(`User deletion attempt: ${id} - ${deleted ? 'successful' : 'not found'}`);
      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
}
