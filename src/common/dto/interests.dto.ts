import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInterestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class InterestResponseDto {
  name: string;
  category?: string;
}
