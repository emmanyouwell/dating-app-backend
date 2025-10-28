import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';

/**
 * DTO for preference update input
 */
export class UpdatePreferenceDto {
  @IsOptional()
  @IsArray()
  @IsIn(['male', 'female', 'other'], { each: true })
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
}

/**
 * DTO for preference response
 */
export class PreferenceResponseDto {
  genderPreference?: string[];
  minAge?: number;
  maxAge?: number;
  maxDistance?: number; // in kilometers
}
