import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
} from '../common/dto/auth.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   * @param userData - User registration data
   * @param res - Express response object
   * @returns User data and sets authentication cookie
   */
  @Post('register')
  async register(
    @Body() userData: RegisterDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.authService.register(userData);

      // Set HTTP-only cookie for security
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: parseInt(process.env.JWT_EXPIRES_IN_MS || '604800000'), // 7 days default
      });

      const userResponse: UserResponseDto = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        isEmailVerified: result.user.isEmailVerified || false,
        lastLogin: result.user.lastLogin || new Date(),
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      };

      const response: ApiResponse<UserResponseDto> = {
        success: true,
        message: 'User registered successfully',
        data: userResponse,
        timestamp: new Date().toISOString(),
      };

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      throw new HttpException(
        error.message || 'Registration failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  /**
   * Verify user email with verification code
   * @param body - Email and verification code
   * @param res - Express response object
   * @returns Email verified confirmation message
   */
  @Post('verify-email')
  async verifyEmail(
    @Body() body: { email: string; code: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.verifyEmail(body);
      const response: ApiResponse = {
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw new HttpException(
        error.message || 'Verification failed',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
  /**
   * Send new code to user
   * @param body - User email
   * @param res - Express response object
   * @returns Code sent confirmation message
   */
  @Post('resend-code')
  async resendCode(
    @Body() body: {email:string;},
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.sendNewCode(body.email);
      const response: ApiResponse = {
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw new HttpException(
        error.message || 'Verification failed',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
  /**
   * Login user with email and password
   * @param req - Express request object with user data from LocalAuthGuard
   * @param res - Express response object
   * @returns User data and sets authentication cookie
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const user = req.user as any; // Type assertion for authenticated user
      const result = await this.authService.login(user);

      // Set HTTP-only cookie for security
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: parseInt(process.env.JWT_EXPIRES_IN_MS || '604800000'), // 7 days default
      });

      const userResponse: UserResponseDto = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        isEmailVerified: result.user.isEmailVerified || false,
        lastLogin: result.user.lastLogin || new Date(),
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      };

      const response: ApiResponse<UserResponseDto> = {
        success: true,
        message: 'Login successful',
        data: userResponse,
        timestamp: new Date().toISOString(),
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw new HttpException(
        error.message || 'Login failed',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Logout user by clearing authentication cookie
   * @param res - Express response object
   * @returns Success message
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie('token');

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }

  /**
   * Get current user profile
   * @param req - Express request object with authenticated user
   * @returns Current user data
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request): Promise<ApiResponse<UserResponseDto>> {
    const user = req.user as any; // Type assertion for authenticated user

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified || false,
      lastLogin: user.lastLogin || new Date(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const response: ApiResponse<UserResponseDto> = {
      success: true,
      message: 'Profile retrieved successfully',
      data: userResponse,
      timestamp: new Date().toISOString(),
    };

    return response;
  }
}
