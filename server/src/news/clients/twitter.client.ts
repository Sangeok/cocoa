import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApi } from 'twitter-api-v2';

@Injectable()
export class TwitterClient {
  private readonly client: TwitterApi;
  private readonly logger = new Logger(TwitterClient.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new TwitterApi(
      this.configService.get<string>('TWITTER_BEARER_TOKEN') || '',
    );
  }

  async searchTweets(symbol: string): Promise<any[]> {
    try {
      const searchQuery = `${symbol} crypto -is:retweet lang:en`;
      const tweets = await this.client.v2.search({
        query: searchQuery,
        'tweet.fields': ['author_id', 'created_at', 'public_metrics'],
        max_results: 20,
      });

      return tweets.data.data.map((tweet) => ({
        text: tweet.text,
        metrics: tweet.public_metrics,
        createdAt: tweet.created_at,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch tweets for ${symbol}`, error);
      return [];
    }
  }
}
