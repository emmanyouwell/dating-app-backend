import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from '../message/message.module';
import { SwipeModule } from '../swipe/swipe.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/message/schema/message.schema';
import { Swipe, SwipeSchema } from 'src/swipe/schema/swipe.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Swipe.name, schema: SwipeSchema },
    ]),
    MessageModule,
    forwardRef(() => SwipeModule),
  ],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
