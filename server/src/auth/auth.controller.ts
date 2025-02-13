import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    const access_token = await this.authService.googleLogin(code);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
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
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
    });
    res.redirect(
      `${this.configService.get('CORS_ORIGIN')}/auth/naver/callback`,
    );
  }
}
