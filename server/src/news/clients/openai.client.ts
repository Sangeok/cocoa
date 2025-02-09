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
      max_tokens: 5000,
    });

    const content = response.choices[0].message.content || '';
    
    try {
      // 1. 줄바꿈 문자를 \r\n으로 대체
      const sanitizedContent = content.replace(/\n/g, '\r\n');
      
      // 2. 연속된 공백을 하나로 통일
      const normalizedContent = sanitizedContent.replace(/\s+/g, ' ');
      
      // 3. 특수 문자 이스케이프 처리
      const escapedContent = normalizedContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      // 4. JSON 파싱 시도
      const parsedContent = JSON.parse(escapedContent);
      
      return {
        title: parsedContent.title,
        content: parsedContent.content.trim(),
      };
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse article content: ' + error.message);
    }
  }
}
