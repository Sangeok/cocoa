import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Body,
  Res,
  Param,
  Req,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthService } from '../auth/auth.service';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAdminAuthGuard } from '../admin/guards/jwt-auth.guard';

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
      response.cookie('cocoa_access_token', token, {
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

  @Get(':userId')
  async getPublicProfile(@Param('userId') userId: string) {
    try {
      const profile = await this.userService.getPublicProfile(parseInt(userId));
      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: Request & { user: { id: number } },
    @Body()
    updateData: {
      name?: string;
      bio?: string;
      telegram?: string;
      youtube?: string;
      instagram?: string;
      twitter?: string;
      discord?: string;
      homepage?: string;
      github?: string;
    },
  ) {
    try {
      const updatedUser = await this.userService.updateProfile(
        req.user.id,
        updateData,
      );
      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('admin/detail/:userId')
  async getUserDetail(@Param('userId') userId: string) {
    try {
      const user = await this.userService.findUserDetail(parseInt(userId));
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

  @UseGuards(JwtAdminAuthGuard)
  @Get('admin/list')
  async getUserList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    try {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);

      if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        throw new BadRequestException('Invalid pagination parameters');
      }

      const result = await this.userService.findUsers(pageNumber, limitNumber, search);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('admin/stats')
  async getUserStats() {
    try {
      const stats = await this.userService.getUserStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
