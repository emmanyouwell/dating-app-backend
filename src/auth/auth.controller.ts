import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
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
    @Res({ passthrough: true }) res: Response, // passthrough allows returning value and still setting cookies
  ): Promise<ApiResponse<UserResponseDto>> {
    const result = await this.authService.register(userData);

    // Set HTTP-only cookie
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

    return {
      success: true,
      message: 'User registered successfully',
      data: userResponse,
      timestamp: new Date().toISOString(),
    };
  }
  /**
   * Verify user email with verification code
   * @param body - Object containing email and verification code
   * @returns Confirmation message
   */
  @Post('verify-email')
  async verifyEmail(
    @Body() body: { email: string; code: string },
  ): Promise<ApiResponse> {
    const result = await this.authService.verifyEmail(body);

    return {
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send a new verification code to the user
   * @param body - Object containing user email
   * @returns Confirmation message
   */
  @Post('resend-code')
  async resendCode(@Body() body: { email: string }): Promise<ApiResponse> {
    const result = await this.authService.sendNewCode(body.email);

    return {
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Login user with email and password
   * @param loginDto - Login user input
   * @param res - Express response object to set authentication cookie
   * @returns User data
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponseDto>> {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    // Set HTTP-only cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: parseInt(process.env.JWT_EXPIRES_IN_MS || '604800000'), // 7 days default
      domain:'.emmandev.site',
      path:'/'
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

    return {
      success: true,
      message: 'Login successful',
      data: userResponse,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Logout user by clearing authentication cookie
   * @param res - Express response object
   * @returns Success message
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    await Promise.resolve();
    // Clear authentication cookie
    res.clearCookie('token');

    return {
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
