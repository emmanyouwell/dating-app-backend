import { Module } from '@nestjs/common';
import { SwipeService } from './swipe.service';
import { SwipeController } from './swipe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Swipe, SwipeSchema } from './schema/swipe.schema';

@Module({
  imports: [
     MongooseModule.forFeature([{ name: Swipe.name, schema:SwipeSchema }]),
  ],
  providers: [SwipeService],
  controllers: [SwipeController],
  exports: [SwipeService],
})
export class SwipeModule {}
