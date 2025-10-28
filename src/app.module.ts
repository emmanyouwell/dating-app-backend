import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { CloudinaryService } from './upload/cloudinary.service';
import { InterestsModule } from './interests/interests.module';
import { PreferencesModule } from './preferences/preferences.module';
import { MatchingModule } from './matching/matching.module';
import { GeocodeService } from './geocode/geocode.service';
import { GeocodeModule } from './geocode/geocode.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/dating-app',
    ),
    AuthModule,
    UploadModule,
    InterestsModule,
    PreferencesModule,
    MatchingModule,
    GeocodeModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService, GeocodeService],
})
export class AppModule {}
