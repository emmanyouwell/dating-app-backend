// schemas/message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true }) from: string;
  @Prop({ required: true }) to: string;
  @Prop({ required: true }) message: string;
  @Prop({ default: Date.now }) createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
