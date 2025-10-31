import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  AuthResponseDto,
  UserResponseDto,
} from '../common/dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/schemas/user.schema';
import { PreferencesService } from 'src/preferences/preferences.service';

/**
 * Authentication service handling user registration, login, and JWT token management
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private preferenceService: PreferencesService,
  ) {}

  /**
   * Validate user credentials for login
   * @param email - User email string
   * @param password - User password string (plain)
   * @returns User data without password if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.logger.warn(`User not found: ${email}`);
        return null;
      }
      this.logger.log('param pass: ', password);
      this.logger.log('user pass: ', user.password);
      const isPasswordMatch = await bcrypt.compare(
        String(password),
        String(user.password),
      );
      this.logger.log('isPasswordMatch: ', isPasswordMatch);
      if (!isPasswordMatch) {
        this.logger.warn(`Invalid credentials for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      this.logger.log(`User ${email} validated successfully`);
      return user;
    } catch (error) {
      this.logger.error(`Error validating user ${email}:`, error);
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
      const result = await this.usersService.sendNewCode(email);
      this.logger.log(result.message);
      return result;
    } catch (error) {
      this.logger.error(`Error in sending new code: ${error}`);
      throw error;
    }
  }
  /**
   * Verify email for authentication
   * @param email - User email
   * @param code - Verification code
   * @returns Confirmation message
   */
  async verifyEmail(body: {
    email: string;
    code: string;
  }): Promise<{ message: string }> {
    try {
      const result = await this.usersService.verifyEmail(body);
      this.logger.log(result.message);
      return result;
    } catch (error) {
      this.logger.log(`Error during verification: ${error}`);
      throw error;
    }
  }
  /**
   * Generate JWT token and return user data for successful login
   * @param email - User email string
   * @param password - User password string (plain)
   * @returns Authentication response with user data and JWT token
   */
  async login(email: string, password: string): Promise<AuthResponseDto> {
    try {
      const user = await this.validateUser(email, password);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);

      const userResponse: UserResponseDto = {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified || false,
        lastLogin: user.lastLogin || new Date(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      this.logger.log(`User ${user.email} logged in successfully`);

      return {
        user: userResponse,
        token,
      };
    } catch (error) {
      this.logger.error(`Error during login:`, error);
      throw error;
    }
  }

  /**
   * Register a new user with hashed password
   * @param userData - User registration data
   * @returns Authentication response with user data and JWT token
   */
  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await this.usersService.create({
        ...userData,
        password: hashedPassword,
      });
      await this.preferenceService.createDefault(user.id);
      this.logger.log(`User ${user.email} registered successfully`);
      return this.login(user.email, userData.password);
    } catch (error) {
      this.logger.error(
        `Error during registration for user ${userData.email}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get user profile by ID
   * @param userId - User ID
   * @returns User profile data without password
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const userResponse: UserResponseDto = {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified || false,
        lastLogin: user.lastLogin || new Date(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      this.logger.log(`Profile retrieved for user ${userId}`);
      return userResponse;
    } catch (error) {
      this.logger.error(`Error retrieving profile for user ${userId}:`, error);
      throw error;
    }
  }
  /**
   * Validate user by their unique MongoDB ID (used by JwtStrategy).
   *
   * @param userId - The MongoDB ObjectId from JWT payload (payload.sub)
   * @returns The user document without sensitive fields
   * @throws UnauthorizedException if user no longer exists
   */
  async validateUserById(userId: string): Promise<User> {
    // Lightweight lookup, no population or sensitive data
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found or account deleted');
    }
    return user;
  }
}
