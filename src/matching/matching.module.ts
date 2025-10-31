import { forwardRef, Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { UsersModule } from 'src/users/users.module';
import { PreferencesModule } from 'src/preferences/preferences.module';
import { MatchingController } from './matching.controller';
@Module({
  imports: [forwardRef(() => UsersModule), PreferencesModule],
  providers: [MatchingService],
  exports: [MatchingService],
  controllers: [MatchingController],
})
export class MatchingModule {}
