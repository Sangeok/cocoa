import { Controller, Get, Query, Res, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieDomain(): string | undefined {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    // 프로덕션 환경에서는 '.coincoin.kr'을 반환
    return isProduction ? '.coincoin.kr' : undefined;
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    const tokens = await this.authService.googleLogin(code);
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: this.getCookieDomain(),
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: this.getCookieDomain(),
    });
    
    res.redirect(
      `${this.configService.get('CORS_ORIGIN')}/auth/google/callback`,
    );
  }

  @Get('naver/callback')
  async naverCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const access_token = await this.authService.naverLogin(code, state);
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: this.getCookieDomain(),
    });
    
    res.redirect(
      `${this.configService.get('CORS_ORIGIN')}/auth/naver/callback`,
    );
  }

  @Post('refresh')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.refreshToken(refreshToken);
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      domain: this.getCookieDomain(),
    });
    
    return tokens;
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: this.getCookieDomain(),
      maxAge: 0,
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: this.getCookieDomain(),
      maxAge: 0,
    });

    return { success: true };
  }
}
