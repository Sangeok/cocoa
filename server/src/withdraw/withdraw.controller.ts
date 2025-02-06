import { Controller, Get, Query } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { PathQueryParams } from './types/withdraw.types';

@Controller('withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Get('path')
  async getOptimalPath(@Query() query: PathQueryParams) {
    const { coin, amount, from, to } = query;
    return this.withdrawService.findOptimalPath(coin, Number(amount), from, to);
  }
}
