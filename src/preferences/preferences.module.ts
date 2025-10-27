import { Module } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Preference, PreferenceSchema } from './schema/preferences.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Preference.name, schema: PreferenceSchema },
    ]),
  ],
  providers: [PreferencesService],
  controllers: [PreferencesController],
  exports: [PreferencesService],
})
export class PreferencesModule {}
