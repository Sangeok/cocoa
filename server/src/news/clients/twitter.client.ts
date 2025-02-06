import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApi, TweetSearchRecentV2Paginator } from 'twitter-api-v2';

@Injectable()
export class TwitterClient {
  private readonly client: TwitterApi;
  private readonly logger = new Logger(TwitterClient.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new TwitterApi(
      this.configService.get<string>('TWITTER_BEARER_TOKEN') || '',
    );
  }

  async searchTweets(symbol: string): Promise<[]> {
    try {
      const searchQuery = `${symbol} crypto -is:retweet lang:en`;
      const tweets = await this.client.v2.search({
        query: searchQuery,
        max_results: 20,
        'tweet.fields': [
          'created_at',
          'public_metrics',
          'author_id',
          'conversation_id',
        ],
        'user.fields': ['name', 'username', 'public_metrics'],
        expansions: ['author_id'],
      });

      this.logger.debug(`Tweets: ${JSON.stringify(tweets)}`);

      // if (!tweets.success) {
      //   this.logger.error(`Failed to fetch tweets for ${symbol}`, tweets);
      //   return [];
      // }
      // return tweets.data._realData.data;
      return [];
    } catch (error) {
      this.logger.error(`Failed to fetch tweets for ${symbol}`, error);
      throw error;
    }
  }
}
