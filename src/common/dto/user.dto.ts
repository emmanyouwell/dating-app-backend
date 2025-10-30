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
  @Transform(({ value }: { value: unknown }) => {
    if (value === null || value === undefined) return undefined;

    // If value is already an array of numbers
    if (Array.isArray(value) && value.every((v) => typeof v === 'number')) {
      return value;
    }

    // If it's a string, attempt to parse safely
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (
          Array.isArray(parsed) &&
          parsed.every((v) => typeof v === 'number')
        ) {
          return parsed;
        }
        return undefined; // parsed but not valid coordinates
      } catch {
        return undefined; // invalid JSON
      }
    }

    // Otherwise, invalid type
    return undefined;
  })
  coordinates!: number[];
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
  @Transform(({ value }: { value: unknown }) => {
    if (value === null || value === undefined) return undefined;

    // If it's already an object, just return it safely
    if (typeof value === 'object') return value as LocationDto;

    // If it's a string, try parsing it safely
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as LocationDto;
        return parsed;
      } catch {
        return undefined; // avoid unsafe JSON.parse failures
      }
    }

    // fallback — if it's neither string nor object
    return undefined;
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
  @Transform(({ value }) => {
    if (!value) return undefined;

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return new Date(value);
    }

    return undefined; // ignore invalid inputs
  })
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
  @Transform(({ value }: { value: unknown }): Types.ObjectId[] | undefined => {
    if (value === null || value === undefined) return undefined;

    let arr: unknown;

    if (typeof value === 'string') {
      try {
        arr = JSON.parse(value) as unknown;
      } catch {
        return undefined;
      }
    } else {
      arr = value;
    }

    if (!Array.isArray(arr)) return undefined;

    const objectIds = arr
      .map((v) => {
        if (typeof v === 'string' && Types.ObjectId.isValid(v)) {
          return new Types.ObjectId(v);
        }
        return null;
      })
      .filter((v): v is Types.ObjectId => v !== null);

    return objectIds.length > 0 ? objectIds : undefined;
  })
  interests?: Types.ObjectId[];

  // --- address ---
  @IsOptional()
  @Transform(({ value }: { value: unknown }): AddressDto | undefined => {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as AddressDto;
        return parsed;
      } catch {
        return undefined;
      }
    }

    if (typeof value === 'object' && value !== null) {
      return value as AddressDto;
    }

    return undefined;
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  // --- avatar ---
  @IsOptional()
  @Transform(({ value }: { value: unknown }): AvatarDto | undefined => {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as AvatarDto;
        return parsed;
      } catch {
        return undefined;
      }
    }

    if (typeof value === 'object' && value !== null) {
      return value as AvatarDto;
    }

    return undefined;
  })
  @ValidateNested()
  @Type(() => AvatarDto)
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
