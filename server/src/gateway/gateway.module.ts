import { Global, Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { ChatModule } from '../chat/chat.module';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  imports: [ChatModule],
  providers: [AppGateway, JwtService],
  exports: [AppGateway],
})
export class GatewayModule {} 