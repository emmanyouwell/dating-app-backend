import {
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  IsArray,
  IsDate,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for user's address information
 */
class AddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'City name must not exceed 100 characters' })
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Barangay name must not exceed 100 characters' })
  brgy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Street name must not exceed 200 characters' })
  street?: string;
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
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsEnum(['heterosexual', 'homosexual', 'bisexual', 'other'])
  sexualOrientation?: 'heterosexual' | 'homosexual' | 'bisexual' | 'other';
}
