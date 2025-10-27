import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from 'src/common/dto/interests.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Response } from 'express';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createInterestDto: CreateInterestDto) {
    return this.interestsService.create(createInterestDto);
  }

  @Get()
  findAll() {
    return this.interestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interestsService.findOne(id);
  }

  /**
   * Delete interests
   * @param id - Interest ObjectID
   * @param res - Express response object
   * @returns Success status and message
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.interestsService.remove(id);
    const response = {
      success: true,
      message: 'Interest deleted successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }
  catch(error) {
    if (error instanceof HttpException) {
      throw error; // already a valid Nest exception
    }

    if (error instanceof Error) {
      throw new HttpException(
        error.message || 'Interest deletion failed',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // fallback for truly unknown types
    throw new HttpException('Interest deletion failed', HttpStatus.UNAUTHORIZED);
  }
}
