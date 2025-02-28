import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  
  // 요청 크기 제한 설정
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  
  const corsOrigin = configService.get('CORS_ORIGIN');
  const adminOrigin = configService.get('ADMIN_ORIGIN');
  
  logger.log(`Enabling CORS for origins: ${corsOrigin}, ${adminOrigin}`);
  
  app.enableCors({
    origin: [corsOrigin, adminOrigin],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Cookie', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });
  
  app.use(cookieParser());
  
  const port = configService.get('PORT') ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
