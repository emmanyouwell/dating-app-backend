import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GeocodeService } from './geocode.service';
import { AddressDto } from 'src/common/dto/user.dto';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { GeocodeResponseDto } from 'src/common/dto/geocode.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('geocode')
export class GeocodeController {
  constructor(private geocodeServices: GeocodeService) {}

  /**
   * Search for address locations
   * @param body AddressDto | Address fields such as street, brgy, city
   * @returns Promise<ApiResponse<GeocodeResponseDto[]>> | Array of geocodes and display name
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async searchAddress(
    @Query() query: AddressDto,
  ): Promise<ApiResponse<GeocodeResponseDto[]>> {
    const results = await this.geocodeServices.getCoordinates(query);
    return {
      success: true,
      message: 'Coordinates fetched successfully',
      data: results,
      timestamp: new Date().toISOString(),
    };
  }
}
