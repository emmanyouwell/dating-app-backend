import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  PreferenceResponseDto,
  UpdatePreferenceDto,
} from 'src/common/dto/preferences.dto';
import type { Request } from 'express';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';

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
    @Req() req: Request & { user: AuthenticatedUser },
  ): Promise<ApiResponse<PreferenceResponseDto>> {
    const preference = await this.preferencesService.findByUser(
      req.user._id.toHexString(),
    );
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
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: UpdatePreferenceDto,
  ): Promise<ApiResponse<PreferenceResponseDto>> {
    this.logger.log('req: ', req.user);
    const updatedPreference = await this.preferencesService.update(
      req.user._id.toHexString(),
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
