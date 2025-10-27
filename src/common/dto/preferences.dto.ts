import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class UpdatePreferencesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  preferences: string[]; // array of preference IDs or tags
}
