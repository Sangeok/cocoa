import { Controller, Post, Get, Query, Param } from '@nestjs/common';
import { YieldService } from './yield.service';

export type SortField = 'tvl' | 'apy' | 'daily' | 'weekly';
export type SortOrder = 'asc' | 'desc';

@Controller('yields')
export class YieldController {
  constructor(private readonly yieldService: YieldService) {}

  @Get()
  async getYields(
    @Query('page') page: string = '1',
    @Query('size') size: string = '20',
    @Query('sortBy') sortBy: SortField = 'tvl',
    @Query('order') order: SortOrder = 'desc',
    @Query('search') search?: string,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const pageNumber = parseInt(page);
    const pageSize = parseInt(size);
    return this.yieldService.getYields(
      pageNumber,
      pageSize,
      sortBy,
      order,
      search,
    );
  }

  @Post('fetch')
  async fetchYields() {
    return this.yieldService.fetchAndSaveYields();
  }

  @Get('project/:name')
  async getProjectYields(@Param('name') projectName: string) {
    return this.yieldService.getProjectYields(projectName);
  }
}
