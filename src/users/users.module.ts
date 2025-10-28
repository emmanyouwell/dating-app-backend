import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { EmailService } from './email.service';
import { UsersController } from './users.controller';
import { CloudinaryService } from 'src/upload/cloudinary.service';
import { GeocodeModule } from 'src/geocode/geocode.module';

@Module({
  imports: [
    GeocodeModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, EmailService, CloudinaryService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
