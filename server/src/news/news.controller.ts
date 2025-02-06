import { Controller, Get, Query, Param } from '@nestjs/common';
import { NewsService } from './news.service';

interface NewsQueryParams {
  symbol?: string;
  limit?: number;
  page?: number;
}

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getNews(@Query() query: NewsQueryParams) {
    const limit = Math.min(Number(query.limit) || 10, 20); // 기본값 10, 최대 20
    const page = Number(query.page) || 1;
    const symbol = query.symbol;

    return this.newsService.getNews({
      limit,
      offset: (page - 1) * limit,
      symbol,
    });
  }

  @Get('recent')
  async getRecentNews(@Query() query: NewsQueryParams) {
    const limit = Math.min(Number(query.limit) || 10, 20); // 기본값 10, 최대 20
    const page = Number(query.page) || 1;
    const symbol = query.symbol;

    return this.newsService.getRecentNews({
      limit,
      offset: (page - 1) * limit,
      symbol,
    });
  }

  @Get('/read/:id')
  async readNews(@Param('id') id: string) {
    return this.newsService.readNews(id);
  }
}
