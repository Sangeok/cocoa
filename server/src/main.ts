import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true, // 쿠키를 주고받을 수 있도록 설정
  });
  
  app.use(cookieParser());
  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
