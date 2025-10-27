import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Res,
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
   * Updates the user's profile (name, bio, birthday, or avatar).
   *
   * @route PATCH /users/:id/profile
   * @param id - User ID from route parameter.
   * @param file - Uploaded image file (optional).
   * @param updateUserProfileDto - Partial update payload.
   *
   * @returns Object containing the updated user and success message.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/profile')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateUserProfileDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      const updatedUser = await this.usersService.updateProfile(
        userId,
        updateUserProfileDto,
        file,
      );
      const response: ApiResponse<UserResponseDto> = {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
        timestamp: new Date().toISOString(),
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // already a valid Nest exception
      }

      if (error instanceof Error) {
        throw new HttpException(
          error.message || 'Profile update failed',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // fallback for truly unknown types
      throw new HttpException('Profile update failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
