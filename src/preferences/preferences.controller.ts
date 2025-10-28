import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  PreferenceResponseDto,
  UpdatePreferenceDto,
} from 'src/common/dto/preferences.dto';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';

@Controller('preferences')
export class PreferencesController {
  private readonly logger = new Logger(PreferencesController.name);
  constructor(private readonly preferencesService: PreferencesService) {}

  /**
   * Get user's preferences
   * @param req - Express request object
   * @param res - Express response object
   * @returns User's preference object
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyPreferences(
    @CurrentUser() user: User,
  ): Promise<ApiResponse<PreferenceResponseDto>> {
    const preference = await this.preferencesService.findByUser(user.id);
    return {
      success: true,
      message: 'Preference fetched successfully',
      data: preference,
      timestamp: new Date().toISOString(),
    };
  }
  /**
   * Update current user's preferences
   * @param req - Express request object
   * @param dto - Update preference input dto
   * @param res - Express response object
   * @returns Updated preference object
   */
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyPreferences(
    @CurrentUser() user: User,
    @Body() dto: UpdatePreferenceDto,
  ): Promise<ApiResponse<PreferenceResponseDto>> {
    const updatedPreference = await this.preferencesService.update(
      user.id,
      dto,
    );

    return {
      success: true,
      message: 'Preference updated successfully',
      data: updatedPreference,
      timestamp: new Date().toISOString(),
    };
  }
}
