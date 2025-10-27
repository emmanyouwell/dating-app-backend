import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InterestsService } from './interests.service';
import {
  CreateInterestDto,
  InterestResponseDto,
} from 'src/common/dto/interests.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Response } from 'express';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  /**
   * Create new interest tags
   * @param createInterestDto - Interest input dto
   * @param res - Express response object
   * @returns Created interest document
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createInterestDto: CreateInterestDto,
    @Res() res: Response,
  ) {
    try {
      const interest = await this.interestsService.create(createInterestDto);
      const response: ApiResponse<InterestResponseDto> = {
        success: true,
        message: 'Interest deleted successfully',
        data: interest,
        timestamp: new Date().toISOString(),
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // already a valid Nest exception
      }
      if (error instanceof Error) {
        throw new HttpException(
          error.message || 'Interest not created',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // fallback for truly unknown types
      throw new HttpException('Interest not created', HttpStatus.UNAUTHORIZED);
    }
  }
  /**
   * Fetches and returns all interest tags
   * @param res - Express response object
   * @returns Array of interest tags
   */
  @Get()
  async findAll(@Res() res: Response) {
    try {
      const interest = await this.interestsService.findAll();
      const response: ApiResponse<InterestResponseDto[]> = {
        success: true,
        message: 'Interest deleted successfully',
        data: interest,
        timestamp: new Date().toISOString(),
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // already a valid Nest exception
      }

      if (error instanceof Error) {
        throw new HttpException(
          error.message || 'Interests not fetched',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // fallback for truly unknown types
      throw new HttpException('Interests not fetched', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Find one interest by id
   * @param id - Interest ObjectId from MongoDB
   * @returns One interest object
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<InterestResponseDto>> {
    const interest = await this.interestsService.findOne(id);

    return {
      success: true,
      message: 'Interest fetched successfully',
      data: interest,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete interest by ID
   * @param id - Interest ObjectID
   * @returns Success status and message
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.interestsService.remove(id);
    return {
      success: true,
      message: 'Interest deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
