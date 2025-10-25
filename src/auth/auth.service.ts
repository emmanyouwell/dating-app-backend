import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, AuthResponseDto, UserResponseDto } from '../common/dto/auth.dto';
import * as bcrypt from 'bcrypt';
import type {StringValue} from 'ms';

/**
 * Authentication service handling user registration, login, and JWT token management
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials for login
   * @param email - User email
   * @param password - User password
   * @returns User data without password if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        this.logger.log(`User ${email} validated successfully`);
        return result;
      }
      this.logger.warn(`Invalid credentials for email: ${email}`);
      return null;
    } catch (error) {
      this.logger.error(`Error validating user ${email}:`, error);
      throw error;
    }
  }

  /**
   * Generate JWT token and return user data for successful login
   * @param user - Authenticated user object
   * @returns Authentication response with user data and JWT token
   */
  async login(user: any): Promise<AuthResponseDto> {
    try {
      const payload = { email: user.email, sub: user.id };
      // Ensure expiresIn is a string or number, not undefined
      const expiresInEnv = process.env.JWT_EXPIRES_IN;
      const expiresIn = (expiresInEnv || '7d') as StringValue;
      const token = this.jwtService.sign(payload, { expiresIn});
      
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
      this.logger.error(`Error during login for user ${user.email}:`, error);
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

      const { password, ...result } = user;
      this.logger.log(`User ${userData.email} registered successfully`);
      return this.login(result);
    } catch (error) {
      this.logger.error(`Error during registration for user ${userData.email}:`, error);
      throw error;
    }
  }

  /**
   * Handle user logout (for HTTP-only cookies, logout is handled by clearing the cookie)
   * @returns Success message
   */
  async logout(): Promise<{ message: string }> {
    this.logger.log('User logged out');
    return { message: 'Logged out successfully' };
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
}
