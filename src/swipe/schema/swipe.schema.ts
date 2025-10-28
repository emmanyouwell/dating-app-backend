import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Swipe document
 */
export type SwipeDocument = Swipe & Document;

/**
 * Swipe schema
 */
@Schema({ timestamps: true })
export class Swipe {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // the one doing the swipe

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  candidateId: Types.ObjectId; // the one being swiped on

  @Prop({ type: String, enum: ['left', 'right'], required: true })
  action: 'left' | 'right';

  @Prop({ type: Boolean, default: false })
  isMutualMatch: boolean; // true only when both users swiped right
}

export const SwipeSchema = SchemaFactory.createForClass(Swipe);
