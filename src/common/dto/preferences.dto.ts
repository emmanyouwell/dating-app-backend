import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Types } from 'mongoose';

export class UpdatePreferenceDto {
  @IsOptional()
  @IsArray()
  @IsIn(['Male', 'Female', 'Other'], { each: true })
  genderPreference?: string[];

  @IsOptional()
  @IsInt()
  @Min(18)
  minAge?: number;

  @IsOptional()
  @IsInt()
  maxAge?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxDistance?: number; // in kilometers

  @IsOptional()
  @IsArray()
  preferredInterests?: Types.ObjectId[];
}

export class PreferenceResponseDto {
  genderPreference?: string[];
  minAge?: number;
  maxAge?: number;
  maxDistance?: number; // in kilometers
  interests?: Types.ObjectId[];
}
