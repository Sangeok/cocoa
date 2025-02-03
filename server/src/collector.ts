import { NestFactory } from '@nestjs/core';
import { CollectorModule } from './collector/collector.module';

async function bootstrap() {
  const app = await NestFactory.create(CollectorModule);
  await app.init();
  
  // 프로세스가 종료되지 않도록 유지
  await new Promise(() => {});
}
bootstrap(); 