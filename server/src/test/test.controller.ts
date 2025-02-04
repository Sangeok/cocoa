import { Controller, Post } from '@nestjs/common';
import { CollectorService } from '../collector/collector.service';

@Controller('test')
export class TestController {
  constructor(private readonly collectorService: CollectorService) {}

  @Post('collect/upbit-markets')
  async testCollectUpbitMarkets() {
    await this.collectorService.collectUpbitMarkets();
    return { message: 'Upbit markets collection completed' };
  }

  @Post('collect/exchange-rate')
  async testCollectExchangeRate() {
    await this.collectorService.collectExchangeRate();
    return { message: 'Exchange rate collection completed' };
  }

  @Post('collect/exchange-rate-history')
  async testStoreExchangeRateHistory() {
    await this.collectorService.storeExchangeRateHistory();
    return { message: 'Exchange rate history stored' };
  }

  @Post('collect/fees')
  async testCollectExchangeFees() {
    await this.collectorService.collectExchangeFees();
    return { message: 'Exchange fees collection completed' };
  }

  @Post('collect/minute-data')
  async testCollectMinuteData() {
    await this.collectorService.collectMinuteData();
    return { message: 'Minute data collection completed' };
  }

  @Post('collect/hour-data')
  async testCollectHourData() {
    await this.collectorService.collectHourData();
    return { message: 'Hour data collection completed' };
  }

  @Post('collect/daily-data')
  async testCollectDailyData() {
    await this.collectorService.collectDailyData();
    return { message: 'Daily data collection completed' };
  }
}
