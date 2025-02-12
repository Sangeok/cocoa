import { Global, Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { ChatModule } from '../chat/chat.module';

@Global()
@Module({
  imports: [ChatModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {} 