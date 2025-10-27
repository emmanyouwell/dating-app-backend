import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto, LoginDto, UserResponseDto } from '../common/dto/auth.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

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
      if (error instanceof HttpException) {
        throw error; // already a valid Nest exception
      }

      if (error instanceof Error) {
        throw new HttpException(
          error.message || 'Registration failed',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // fallback for truly unknown types
      throw new HttpException('Registration failed', HttpStatus.UNAUTHORIZED);
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
      if (error instanceof HttpException) {
        throw error; // already a valid Nest exception
      }

      if (error instanceof Error) {
        throw new HttpException(
          error.message || 'Verification failed',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // fallback for truly unknown types
      throw new HttpException('Verification failed', HttpStatus.UNAUTHORIZED);
    }
  }
  /**
   * Send new code to user
   * @param body - User email
   * @param res - Express response object
   * @returns Code sent confirmation message
   */

  @Post('resend-code')
  async resendCode(@Body() body: { email: string }, @Res() res: Response) {
    try {
      const result = await this.authService.sendNewCode(body.email);
      const response: ApiResponse = {
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // already a valid Nest exception
      }

      if (error instanceof Error) {
        throw new HttpException(
          error.message || 'Verification failed',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // fallback for truly unknown types
      throw new HttpException('Verification failed', HttpStatus.UNAUTHORIZED);
    }
  }
  /**
   * Login user with email and password
   * @param loginDto - Login user input
   * @param res - Express response object
   * @returns User data and sets authentication cookie
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    try {
      const result = await this.authService.login(
        loginDto.email,
        loginDto.password,
      );

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
      if (error instanceof HttpException) {
        throw error; // already a valid Nest exception
      }

      if (error instanceof Error) {
        throw new HttpException(
          error.message || 'Login failed',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // fallback for truly unknown types
      throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Logout user by clearing authentication cookie
   * @param res - Express response object
   * @returns Success message
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res() res: Response): void {
    res.clearCookie('token');

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
}
