import { Controller, Post, Param, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SwipeService } from './swipe.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Controller('swipes')
@UseGuards(JwtAuthGuard)
export class SwipeController {
  constructor(private readonly swipeService: SwipeService) {}

  /**
   * Swipe right action endpoint
   * @param user User | Current user ID
   * @param candidateId string | Candidate user ID
   * @returns Promise<ApiResponse>
   */
  @Post('right/:candidateId')
  async swipeRight(
    @CurrentUser() user: User,
    @Param('candidateId') candidateId: string,
  ): Promise<ApiResponse> {
    const userId = user.id;
    await this.swipeService.swipeRight(userId, candidateId);
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
  @Post('left/:candidateId')
  async swipeLeft(
    @CurrentUser() user: User,
    @Param('candidateId') candidateId: string,
  ): Promise<ApiResponse> {
    const userId = user.id;
    await this.swipeService.swipeLeft(userId, candidateId);
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
      message: 'Chat unlocked!',
      data: allowed,
      timestamp: new Date().toISOString(),
    };
  }
}
