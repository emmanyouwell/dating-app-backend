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
class LocationDto {
  @IsEnum(['Point'])
  readonly type = 'Point' as const;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates: number[]; // [longitude, latitude]
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
  @Type(() => LocationDto)
  location?: LocationDto;
}

/**
 * DTO for update user profile
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortBio?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'non-binary', 'other'])
  gender?: 'male' | 'female' | 'non-binary' | 'other';

  @IsOptional()
  @IsArray()
  @Transform(({ value }: { value: string[] }) =>
    value.map((v: string) => new Types.ObjectId(v)),
  )
  interests?: Types.ObjectId[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

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
