import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for interest creation
 */
export class CreateInterestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;
}

/**
 * DTO for interest response
 */
export class InterestResponseDto {
  name: string;
  category?: string;
}
