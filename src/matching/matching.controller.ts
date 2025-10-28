import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { MatchingService } from './matching.service';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { LimitedUserProfileDto } from 'src/common/dto/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  /**
   * Find potential matches for the user
   * @param user User | User who made the request
   * @returns Promise<ApiResponse<LimitedUserProfileDto[]>> | Array of potential candidates
   */
  @Get()
  async findMatches(
    @CurrentUser() user: User,
  ): Promise<ApiResponse<LimitedUserProfileDto[]>> {
    const result = await this.matchingService.findMatches(user.id);
    return {
      success: true,
      message: 'Matches fetched succesfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
