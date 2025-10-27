import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(filePath: string): Promise<UploadApiResponse> {
    try {
      return await cloudinary.uploader.upload(filePath, {
        folder: 'dating-app/avatar', // customize your folder name
        resource_type: 'image',
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // already a valid Nest exception
      }

      if (error instanceof Error) {
        throw new HttpException(
          error.message || 'Cloudinary upload failed',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // fallback for truly unknown types

      throw new Error(`Cloudinary upload failed: ${HttpStatus.UNAUTHORIZED}`);
    }
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // already a valid Nest exception
      }

      if (error instanceof Error) {
        throw new HttpException(
          error.message || 'Cloudinary deletion failed',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // fallback for truly unknown types

      throw new Error(`Cloudinary deletion failed: ${HttpStatus.UNAUTHORIZED}`);
    }
  }
}
