import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InterestDocument = Interest & Document;

@Schema({ timestamps: true })
export class Interest {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  icon?: string; // Optional - could store a Cloudinary URL or emoji

  @Prop({ default: null })
  category?: string; // e.g., "Sports", "Music", "Food"
}

export const InterestSchema = SchemaFactory.createForClass(Interest);
