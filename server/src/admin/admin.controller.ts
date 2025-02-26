import { Body, Controller, Get, Post, Put, UseGuards, Param } from '@nestjs/common';
import { AdminService, RegisterAdminDto } from './admin.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UpdateAdminDto, UpdatePasswordDto } from './dto/update-admin.dto';
import { JwtAdminAuthGuard } from './guards/jwt-auth.guard';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { Admin } from '../database/schema/admin';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.adminService.login(loginDto);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('profile')
  async getProfile(@CurrentAdmin() admin: Admin) {
    return this.adminService.getProfile(admin.id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Put('profile')
  async updateProfile(
    @CurrentAdmin() admin: Admin,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.updateProfile(admin.id, updateAdminDto);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Put('password')
  async updatePassword(
    @CurrentAdmin() admin: Admin,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.adminService.updatePassword(admin.id, updatePasswordDto);
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.adminService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('logout')
  async logout(@CurrentAdmin() admin: Admin) {
    return this.adminService.logout(admin.id);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterAdminDto) {
    try {
      const admin = await this.adminService.register(registerDto);
      return {
        success: true,
        message: '관리자 계정이 생성되었습니다. 승인을 기다려주세요.',
        data: {
          id: admin.id,
          email: admin.email,
          isApproved: admin.isApproved,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAdminAuthGuard)
  @Put('approve/:id')
  async approveAdmin(@Param('id') id: string) {
    try {
      const admin = await this.adminService.approveAdmin(parseInt(id));
      return {
        success: true,
        message: '관리자가 승인되었습니다.',
        data: admin,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
