import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { GoogleClient } from './client/google.client';
import { NaverClient } from './client/naver.client';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { DrizzleClient } from '../database/database.module';
import { predicts } from '../database/schema/predict';

@Injectable()
export class AuthService {
  constructor(
    private readonly googleClient: GoogleClient,
    private readonly naverClient: NaverClient,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
  ) {}

  async googleLogin(code: string) {
    const accessToken = await this.googleClient.getToken(code);
    const userInfo = await this.googleClient.getUserInfo(accessToken);

    let user = await this.userService.findBySocialId(userInfo.socialId);
    if (!user) {
      user = await this.userService.create(userInfo);
      // 새로운 사용자의 predict 레코드 생성
      await this.createInitialPredict(user.id);
    }

    return this.generateToken(user);
  }

  async naverLogin(code: string, state: string) {
    const accessToken = await this.naverClient.getToken(code, state);
    const userInfo = await this.naverClient.getUserInfo(accessToken);

    let user = await this.userService.findBySocialId(userInfo.socialId);
    if (!user) {
      user = await this.userService.create(userInfo);
      // 새로운 사용자의 predict 레코드 생성
      await this.createInitialPredict(user.id);
    }

    return this.generateToken(user);
  }

  // 초기 predict 레코드 생성 메서드
  private async createInitialPredict(userId: number) {
    await this.db.insert(predicts).values({
      userId,
      wins: 0,
      losses: 0,
      draws: 0,
      vault: '10000', // 초기 자산
      lastPredictAt: new Date(),
    });
  }

  async generateToken(user: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateAccessToken(user: any): Promise<string> {
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
    };
    
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
  }

  private async generateRefreshToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
    };
    
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const [accessToken, newRefreshToken] = await Promise.all([
        this.generateAccessToken(user),
        this.generateRefreshToken(user),
      ]);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  setTokenCookie(response: Response, token: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const domain = this.configService.get('CORS_ORIGIN'); // 예: .yourdomain.com

    response.cookie('cocoa_access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // production에서는 'none'으로 설정
      domain: isProduction ? domain : undefined, // production에서만 domain 설정
      path: '/',
    });
  }
}
