import { Injectable } from '@nestjs/common';
import { GoogleClient } from './client/google.client';
import { NaverClient } from './client/naver.client';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly googleClient: GoogleClient,
    private readonly naverClient: NaverClient,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async googleLogin(code: string) {
    const accessToken = await this.googleClient.getToken(code);
    const userInfo = await this.googleClient.getUserInfo(accessToken);
    
    let user = await this.userService.findBySocialId(userInfo.socialId);
    if (!user) {
      user = await this.userService.create(userInfo);
    }

    return this.generateToken(user);
  }

  async naverLogin(code: string, state: string) {
    const accessToken = await this.naverClient.getToken(code, state);
    const userInfo = await this.naverClient.getUserInfo(accessToken);
    
    let user = await this.userService.findBySocialId(userInfo.socialId);
    if (!user) {
      user = await this.userService.create(userInfo);
    }

    return this.generateToken(user);
  }

  generateToken(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  setTokenCookie(response: Response, token: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const domain = this.configService.get('COOKIE_DOMAIN'); // 예: .yourdomain.com
    
    response.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // production에서는 'none'으로 설정
      domain: isProduction ? domain : undefined, // production에서만 domain 설정
      path: '/',
    });
  }

  // 로그인 메서드
  async login(user: any, response: Response) {
    const token = this.generateToken(user);
    this.setTokenCookie(response, token);
    return {
      success: true,
      data: user,
    };
  }
}
