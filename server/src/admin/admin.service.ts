import {
  Injectable,
  UnauthorizedException,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { admins } from '../database/schema/admin';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UpdateAdminDto, UpdatePasswordDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';
import { DrizzleClient } from '../database/database.module';
import { Admin } from '../database/schema/admin';

export interface RegisterAdminDto {
  email: string;
  password: string;
}

@Injectable()
export class AdminService {
  constructor(
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const admin = await this.db
      .select()
      .from(admins)
      .where(eq(admins.email, loginDto.email));

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin[0].passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login time
    await this.db
      .update(admins)
      .set({ lastLoginAt: new Date() })
      .where(eq(admins.id, admin[0].id));

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(admin[0].id),
      this.generateRefreshToken(admin[0].id),
    ]);

    return { accessToken, refreshToken };
  }

  async getProfile(adminId: number) {
    const [admin] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.id, adminId));

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const { passwordHash, passwordSalt, ...profile } = admin;
    return profile;
  }

  async updateProfile(adminId: number, updateAdminDto: UpdateAdminDto) {
    await this.db
      .update(admins)
      .set({
        ...updateAdminDto,
        updatedAt: new Date(),
      })
      .where(eq(admins.id, adminId));

    return this.getProfile(adminId);
  }

  async updatePassword(adminId: number, updatePasswordDto: UpdatePasswordDto) {
    const admin = await this.db
      .select()
      .from(admins)
      .where(eq(admins.id, adminId));

    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      admin[0].passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(updatePasswordDto.newPassword, salt);

    await this.db
      .update(admins)
      .set({
        passwordHash: hash,
        passwordSalt: salt,
        updatedAt: new Date(),
      })
      .where(eq(admins.id, adminId));

    return { message: 'Password updated successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_ADMIN_REFRESH_SECRET'),
      });

      // 새로운 액세스 토큰과 리프레시 토큰을 모두 발급
      const [accessToken, newRefreshToken] = await Promise.all([
        this.generateAccessToken(payload.sub),
        this.generateRefreshToken(payload.sub),
      ]);

      return { 
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(adminId: number) {
    // 실제 구현에서는 토큰 블랙리스트 관리가 필요할 수 있음 
    return { message: 'Logged out successfully' };
  }

  private async generateAccessToken(adminId: number): Promise<string> {
    return this.jwtService.signAsync(
      { sub: adminId },
      {
        secret: this.configService.get<string>('JWT_ADMIN_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  private async generateRefreshToken(adminId: number): Promise<string> {
    return this.jwtService.signAsync(
      { sub: adminId },
      {
        secret: this.configService.get<string>('JWT_ADMIN_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }

  async register(registerDto: RegisterAdminDto): Promise<Admin> {
    const [existingAdmin] = await this.db
      .select()
      .from(admins)
      .where(eq(admins.email, registerDto.email));

    if (existingAdmin) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(registerDto.password, salt);

    const [newAdmin] = await this.db
      .insert(admins)
      .values({
        email: registerDto.email,
        passwordHash: hash,
        passwordSalt: salt,
        name: registerDto.email.split('@')[0], // 임시 이름으로 이메일 아이디 사용
        phoneNumber: '000-0000-0000', // 임시 전화번호
        isApproved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newAdmin;
  }

  // 관리자 승인 메서드
  async approveAdmin(adminId: number): Promise<Admin> {
    const [admin] = await this.db
      .update(admins)
      .set({
        isApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(admins.id, adminId))
      .returning();

    return admin;
  }
}
