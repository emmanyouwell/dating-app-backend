import {
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from 'src/users/schemas/user.schema';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  constructor(private readonly chatService: ChatService) {}

  @Get('messages/:roomName')
  async getMessagesForRoom(
    @Param('roomName') roomName: string,
    @CurrentUser() user: User,
  ) {
    const userId = user.id;
    const [userA, userB] = roomName.split(':');
    if (![userA, userB].includes(userId)) {
      throw new ForbiddenException('Not part of this room');
    }
    return this.chatService.getMessagesForUsers(userA, userB);
  }
}
