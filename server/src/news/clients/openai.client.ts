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
        'HTTP-Referer': this.configService.get<string>(
          'OPENROUTER_HTTP_REFERER',
          'https://github.com/joshephan/cocoa',
        ),
        'X-Title': this.configService.get<string>(
          'OPENROUTER_APP_NAME',
          'COCOA(Coin Coin Korea)',
        ),
      },
    });
  }

  async generateArticle(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<{ title: string; content: string }> {
    const response = await this.openai.chat.completions.create({
      model: 'openai/gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const report = response.choices[0].message.content || '';

    try {
      // 4. 제목과 본문 분리
      const [title, content] = report
        .split('<DIVIDER>')
        .map((part) => part.trim());

      console.log(title, content);
      return {
        title: title,
        content: content,
      };
    } catch (error) {
      console.error('Failed to parse OpenAI response:', report);
      throw new Error('Failed to parse article content: ' + error.message);
    }
  }
}
