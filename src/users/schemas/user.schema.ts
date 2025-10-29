import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CallbackError, Document, Model, Query, Types } from 'mongoose';
import { Interest } from 'src/interests/schema/interests.schema';
import { PreferenceDocument } from 'src/preferences/schema/preferences.schema';
/**
 * User Document
 */
export type UserDocument = User & Document;
/**
 * Location schema
 */
@Schema({ _id: false })
class Location {
  @Prop({
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  })
  type: 'Point';

  @Prop({
    type: [Number], // [longitude, latitude]
    required: true,
  })
  coordinates: number[];
}
/**
 * Address schema
 */
@Schema({ _id: false })
class Address {
  @Prop({ type: String, maxlength: 200 })
  street?: string;

  @Prop({ type: String, maxlength: 100 })
  brgy?: string;

  @Prop({ type: String, maxlength: 100 })
  city?: string;

  @Prop({ type: Location, index: '2dsphere', required: false })
  location?: Location;
}
/**
 * User schema
 */
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: Date.now })
  lastLogin: Date;

  @Prop({ type: String, default: null })
  verificationCode: string | null;

  @Prop({ type: Date, default: null })
  verificationCodeExpiry: Date | null;

  // Profile fields
  @Prop({ type: Date, required: false })
  birthday?: Date; // user can fill this later

  @Prop({ type: String, maxlength: 500, default: '' })
  shortBio?: string;

  @Prop({
    type: Object,
    default: { public_id: null, url: null },
  })
  avatar?: { public_id: string | null; url: string | null };

  @Prop({
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other',
  })
  gender?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Interest' })
  interests?: (Types.ObjectId | Interest)[];

  @Prop({ type: Address, default: null })
  address?: Address;

  @Prop({
    type: String,
    enum: ['heterosexual', 'homosexual', 'bisexual', 'other'],
    default: 'other',
  })
  sexualOrientation?: string;

  @Prop({ type: Date, default: Date.now })
  lastActiveAt?: Date;

  @Prop({ type: Number, default: 0 })
  popularityScore?: number;

  // Virtual fields
  id: string;
  createdAt: Date;
  updatedAt: Date;
  age?: number; // virtual field
}

export const UserSchema = SchemaFactory.createForClass(User);

// Virtual id field
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Virtual age field computed from birthday
UserSchema.virtual('age').get(function () {
  if (!this.birthday) return null;

  const today = new Date();
  const birthDate = new Date(this.birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    const { ...result } = ret; // remove password
    return result;
  },
});
/**
 * Cascade delete the user's preferences when a user is deleted
 */
UserSchema.pre('findOneAndDelete', async function (next) {
  try {
    // `this` is a Query<UserDocument, UserDocument>
    const query = this as Query<UserDocument | null, UserDocument>;

    const user = await query.findOne(query.getQuery()).exec();

    if (user) {
      // Use the global Preference model
      const PreferencesModel: Model<PreferenceDocument> =
        user.model('Preference');
      await PreferencesModel.deleteOne({ userId: user._id }).exec();
    }

    next();
  } catch (error: unknown) {
    next(error as CallbackError);
  }
});
