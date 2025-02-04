import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WebSearchClient {
  private readonly logger = new Logger(WebSearchClient.name);
  private readonly newsApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.newsApiKey = this.configService.get<string>('NEWS_API_KEY') || '';
  }

  async searchNews(symbol: string): Promise<any[]> {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: `${symbol} cryptocurrency`,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 10,
          apiKey: this.newsApiKey,
        },
      });

      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch news for ${symbol}`, error);
      return [];
    }
  }
} 