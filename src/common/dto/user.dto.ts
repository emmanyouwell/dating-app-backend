import { IsString, IsOptional, IsBoolean, IsDate, IsArray } from 'class-validator';

/**
 * DTO for updating user profile
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsBoolean({ message: 'isEmailVerified must be a boolean' })
  isEmailVerified?: boolean;
}

/**
 * DTO for user profile creation
 */
export class CreateProfileDto {
  @IsString({ message: 'Bio must be a string' })
  bio: string;

  @IsString({ message: 'Location must be a string' })
  location: string;

  @IsArray({ message: 'Interests must be an array' })
  @IsString({ each: true, message: 'Each interest must be a string' })
  interests: string[];

  @IsArray({ message: 'Photos must be an array' })
  @IsString({ each: true, message: 'Each photo must be a string' })
  photos: string[];
}
