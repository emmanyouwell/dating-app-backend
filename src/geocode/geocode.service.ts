import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { GeocodeResponseDto } from 'src/common/dto/geocode.dto';
import { AddressDto } from 'src/common/dto/user.dto';

@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Get geolocation (lat/lng) from PickLocation API for a given address.
   * @param address { street, brgy, city }
   * @returns GeocodeResponseDto[] | undefined
   */
  async getCoordinates(
    address: AddressDto,
  ): Promise<GeocodeResponseDto[] | undefined> {
    const fullAddress = `${address.street}, ${address.brgy}, ${address.city}`;
    const url = `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(String(address.street))}&city=${encodeURIComponent(String(address.city))}&country=PH&format=json`;

    const response: AxiosResponse<GeocodeResponseDto[]> =
      await this.httpService.axiosRef.get(url, {
        headers: {
          'User-Agent': 'dating-app/1.0 (emingala02@gmail.com)',
        },
      });

    if (!response.data || response.data.length === 0) {
      this.logger.warn(`No geocode found for address: ${fullAddress}`);
      throw new NotFoundException('Location not found');
    }
    const data = response.data;
    return data;
  }
}
