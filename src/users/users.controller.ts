import {
  Body,
  Controller,
  Param,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from 'src/common/dto/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Response } from 'express';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { UserResponseDto } from 'src/common/dto/auth.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  /**
   * Update a user's profile, optionally with an avatar image
   * @param userId - ID of the user to update
   * @param file - Uploaded avatar file
   * @param updateUserProfileDto - Profile update data
   * @returns Updated user data
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/profile')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateUserProfileDto: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateUserProfileDto,
      file,
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
      timestamp: new Date().toISOString(),
    };
  }
}
