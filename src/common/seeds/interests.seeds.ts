import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { InterestsService } from 'src/interests/interests.service';
import { interests } from '../lib/interests';

async function seedInterests() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const interestsService = app.get(InterestsService);

  const interestsSeed = interests;

  await interestsService.seed(interestsSeed);
  await app.close();
  console.log('✅ Interests seeded successfully!');
}

seedInterests().catch((err) => {
  console.error('❌ Seeding failed', err);
  process.exit(1);
});
