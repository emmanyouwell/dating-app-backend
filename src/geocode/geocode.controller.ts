import { Body, Controller, Get, Post } from '@nestjs/common';
import { GeocodeService } from './geocode.service';
import { AddressDto } from 'src/common/dto/user.dto';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { GeocodeResponseDto } from 'src/common/dto/geocode.dto';

@Controller('geocode')
export class GeocodeController {
  constructor(private geocodeServices: GeocodeService) {}

  @Post()
  async searchAddress(
    @Body() body: AddressDto,
  ): Promise<ApiResponse<GeocodeResponseDto[]>> {
    const results = await this.geocodeServices.getCoordinates(body);
    return {
      success: true,
      message: 'Coordinates fetched successfully',
      data: results,
      timestamp: new Date().toISOString(),
    };
  }
}
