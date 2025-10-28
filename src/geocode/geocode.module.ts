import { Module } from '@nestjs/common';
import { GeocodeService } from './geocode.service';
import { HttpModule } from '@nestjs/axios';
import { GeocodeController } from './geocode.controller';

@Module({
  imports: [HttpModule],
  providers: [GeocodeService],
  exports: [GeocodeService],
  controllers: [GeocodeController],
})
export class GeocodeModule {}
