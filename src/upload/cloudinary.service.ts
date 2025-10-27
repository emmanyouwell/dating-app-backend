import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, DeleteApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload an image file to Cloudinary
   * @param filePath - Local path to the image file
   * @returns The Cloudinary upload response
   * @throws HttpException if the upload fails
   */
  async uploadImage(filePath: string): Promise<UploadApiResponse> {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'dating-app/avatar', // customize your folder name
      resource_type: 'image',
    });

    return result;
  }

  /**
   * Delete an image from Cloudinary by its public ID
   * @param publicId - The Cloudinary public ID of the image
   * @returns Cloudinary destroy response
   * @throws HttpException if deletion fails
   */
  async deleteImage(publicId: string): Promise<DeleteApiResponse> {
    const result: DeleteApiResponse = (await cloudinary.uploader.destroy(
      publicId,
      { resource_type: 'image' },
    )) as DeleteApiResponse;

    return result;
  }
}
