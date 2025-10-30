import {
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  IsArray,
  IsDate,
  ValidateNested,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

/**
 * DTO for address location
 */
export class LocationDto {
  @IsEnum(['Point'])
  readonly type = 'Point' as const;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  coordinates: number[];
}

/**
 * DTO for user's address information
 */
export class AddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Street name must not exceed 200 characters' })
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Barangay name must not exceed 100 characters' })
  brgy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'City name must not exceed 100 characters' })
  city?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @Type(() => LocationDto)
  @ValidateNested()
  location?: LocationDto;
}

/**
 * DTO for Avatar
 */
export class AvatarDto {
  @IsString()
  public_id: string;

  @IsString()
  url: string;
}

/**
 * DTO for update user profile (FormData compatible)
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  birthday?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortBio?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return undefined;
    let arr: string[];
    if (typeof value === 'string') arr = JSON.parse(value);
    else arr = value;
    return arr.map((v: string) => new Types.ObjectId(v));
  })
  interests?: Types.ObjectId[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  @Type(() => AvatarDto)
  @ValidateNested()
  avatar?: AvatarDto;

  @IsOptional()
  @IsEnum(['heterosexual', 'homosexual', 'bisexual', 'other'])
  sexualOrientation?: 'heterosexual' | 'homosexual' | 'bisexual' | 'other';
}

/**
 * DTO for limited user profile response
 */
export class LimitedUserProfileDto {
  _id: string;
  name: string;
  shortBio: string;
  avatarUrl: string | null;
  gender: string | undefined;
  interests: string[];
  popularityScore: number;
  score: number;
}
