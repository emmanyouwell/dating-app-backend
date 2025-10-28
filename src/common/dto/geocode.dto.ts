/**
 * DTO for pickLocation geocode api response
 */
export class GeocodeResponseDto {
  lat: string;
  lon: string;
  display_name: string;
  bounding_box: number[];
}
