import { ObjectId } from 'mongodb';
import { Interest } from 'src/interests/schema/interests.schema';
import { Preference } from 'src/preferences/schema/preferences.schema';

export interface AuthenticatedUser {
  _id: ObjectId; // actual MongoDB _id
  email: string;
  name: string;
  isEmailVerified: boolean;
  password: string;
  verificationCode: string | null;
  verificationCodeExpiry: Date | null;
  shortBio: string;
  avatar: { public_id: string | null; url: string | null };
  gender: string;
  interests: Interest[];
  preferences: Preference[]; // type if you have Preference type
  address: string | null;
  sexualOrientation: string;
  popularityScore: number;
  lastLogin: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
