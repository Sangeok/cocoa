import { Controller, Get, UseGuards, Patch, Body, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthService } from '../auth/auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

interface UpdateNameDto {
  name: string;
}

interface UpdatePhoneDto {
  phoneNumber: string;
}

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() userId: number) {
    try {
      const user = await this.userService.findById(userId);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('Profile error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('name')
  async updateName(
    @CurrentUser() userId: number,
    @Body() data: UpdateNameDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      if (!data.name?.trim()) {
        throw new Error('이름은 필수입니다.');
      }

      const user = await this.userService.update(userId, {
        name: data.name.trim(),
        updatedAt: new Date(),
      });

      // 새 토큰 발급 전에 기존 토큰이 만료되지 않도록 즉시 새 토큰 설정
      const token = this.authService.generateToken(user);
      response.cookie('access_token', token, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('phone')
  async updatePhone(
    @CurrentUser() userId: number,
    @Body() data: UpdatePhoneDto,
  ) {
    try {
      const user = await this.userService.update(userId, {
        phoneNumber: data.phoneNumber.trim(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
