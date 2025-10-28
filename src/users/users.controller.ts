import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { UserResponseDto } from 'src/common/dto/auth.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from './schemas/user.schema';

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
  @Patch('/me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateUserProfileDto: UpdateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const updatedUser = await this.usersService.updateProfile(
      user.id,
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

  /**
   * Get user profile
   * @param user User | Current user logged in
   * @returns Promise<ApiResponse<User>> | User details
   */
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getProfile(@CurrentUser() user: User): Promise<ApiResponse<User>> {
    const details = await this.usersService.findById(user.id);
    if (!details) {
      throw new NotFoundException('User details not found');
    }
    return {
      success: true,
      message: 'User details fetched successfully',
      data: details,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete a user
   * @param id string | User id
   * @returns Promise<ApiResponse>
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param() id: string): Promise<ApiResponse> {
    await this.usersService.delete(id);
    return {
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
