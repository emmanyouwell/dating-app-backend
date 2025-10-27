import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
export type PreferenceDocument = Preference & Document;
@Schema({ timestamps: true })
export class Preference {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({
    type: [String],
    enum: ['Male', 'Female', 'Other'],
    default: ['Male', 'Female', 'Other'],
  })
  genderPreference: string[];

  @Prop({ type: Number, default: 18 })
  minAge: number;

  @Prop({ type: Number, default: 60 })
  maxAge: number;

  @Prop({ type: Number, default: 50 }) // kilometers
  maxDistance: number;

  @Prop({ type: [Types.ObjectId], ref: 'Interest' })
  preferredInterests?: Types.ObjectId[];
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);
