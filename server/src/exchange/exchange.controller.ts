import { Controller, Get } from '@nestjs/common';
import { ExchangeService } from './exchange.service';

@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get('markets')
  async getMarkets() {
    return this.exchangeService.getMarkets();
  }

  @Get('usd-price')
  async getUSDPrice() {
    return this.exchangeService.getUSDPrice();
  }
}
