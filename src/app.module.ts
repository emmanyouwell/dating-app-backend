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
import { SwipeModule } from './swipe/swipe.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { UsersModule } from './users/users.module';
import { LastActiveInterceptor } from './common/interceptors/LastActive.interceptor';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 30, limit: 100 }],
    }),
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
    SwipeModule,
    ChatModule,
    MessageModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CloudinaryService,
    GeocodeService,
    LastActiveInterceptor,
  ],
})
export class AppModule {}
