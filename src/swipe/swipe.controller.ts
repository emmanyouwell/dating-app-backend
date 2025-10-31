import { Controller, Post, Param, UseGuards, Get, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SwipeService } from './swipe.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { MatchingService } from 'src/matching/matching.service';
import { LimitedUserProfileDto } from 'src/common/dto/user.dto';

@Controller('swipes')
@UseGuards(JwtAuthGuard)
export class SwipeController {
  constructor(
    private readonly swipeService: SwipeService,
    private matchService: MatchingService,
  ) {}

  /**
   * Swipe right action endpoint
   * @param user User | Current user ID
   * @param candidateId string | Candidate user ID
   * @returns Promise<ApiResponse>
   */
  @Post('right')
  async swipeRight(
    @CurrentUser() user: User,
    @Body() body: { candidateId: string },
  ): Promise<ApiResponse> {
    const userId = user.id;
    await this.swipeService.swipeRight(userId, body.candidateId);
    return {
      success: true,
      message: 'Swiped right!',
      timestamp: new Date().toISOString(),
    };
  }
  /**
   * Swipe left action endpoint
   * @param user User | Current user ID
   * @param candidateId string | Candidate user ID
   * @returns Promise<ApiResponse>
   */
  @Post('left/')
  async swipeLeft(
    @CurrentUser() user: User,
    @Body() body: { candidateId: string },
  ): Promise<ApiResponse> {
    const userId = user.id;
    await this.swipeService.swipeLeft(userId, body.candidateId);
    return {
      success: true,
      message: 'Swiped left!',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check if chat is unlocked for this user
   * @param user User | Current user ID
   * @param recipientId string | Recipient user ID
   * @returns Promise<ApiResponse<Boolean>>
   */
  @Get('can-message/:recipientId')
  async canMessage(
    @CurrentUser() user: User,
    @Param('recipientId') recipientId: string,
  ): Promise<ApiResponse<boolean>> {
    const userId = user.id;
    const allowed = await this.swipeService.canMessage(userId, recipientId);
    return {
      success: true,
      message: allowed ? 'Chat unlocked!' : 'Chat locked.',
      data: allowed,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/candidates')
  async fetchLikedCandidates(
    @CurrentUser() user: User,
  ): Promise<ApiResponse<LimitedUserProfileDto[]>> {
    const userId = user.id;
    const candidateIds =
      await this.swipeService.getSwipedRightCandidateIds(userId);
    const likedCandidates = await this.matchService.findMatches(
      userId,
      candidateIds,
    );
    return {
      success: true,
      message: 'Liked candidates fetched successfully',
      data: likedCandidates,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('/unmatch')
  async unmatchCandidate(
    @CurrentUser() user: User,
    @Body() body: { candidateId: string },
  ): Promise<ApiResponse> {
    const userId = user.id;
    await this.swipeService.unmatchCandidate(userId, body.candidateId);
    return {
      success: true,
      message: 'Candidate unmatched successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
