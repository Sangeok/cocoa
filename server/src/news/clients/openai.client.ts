import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIClient {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': this.configService.get<string>('OPENROUTER_HTTP_REFERER', 'https://github.com/joshephan/cocoa'),
        'X-Title': this.configService.get<string>('OPENROUTER_APP_NAME', 'COCOA(Coin Coin Korea)'),
      },
    });
  }

  async generateArticle(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'openai/gpt-4',  // OpenRouter 형식의 모델명
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || '';
  }
} 