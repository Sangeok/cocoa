import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface NaverUserInfo {
  response: {
    id: string;
    email: string;
    name: string;
    nickname?: string;
    profile_image?: string;
  };
}

@Injectable()
export class NaverClient {
  constructor(private readonly configService: ConfigService) {}

  async getToken(code: string, state: string): Promise<string> {
    const tokenUrl = 'https://nid.naver.com/oauth2.0/token';
    const { data } = await axios.post(
      tokenUrl,
      {},
      {
        params: {
          grant_type: 'authorization_code',
          client_id: this.configService.get('NAVER_CLIENT_ID'),
          client_secret: this.configService.get('NAVER_CLIENT_SECRET'),
          code,
          state,
        },
      },
    );

    return data.access_token;
  }

  async getUserInfo(accessToken: string) {
    const { data } = await axios.get<NaverUserInfo>(
      'https://openapi.naver.com/v1/nid/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return {
      socialId: data.response.id,
      email: data.response.email,
      name: data.response.name || data.response.nickname || 'Unknown User',
      provider: 'naver' as const,
    };
  }
}
