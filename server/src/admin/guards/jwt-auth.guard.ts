import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DrizzleClient } from '../../database/database.module';
import { Inject } from '@nestjs/common';
import { admins } from '../../database/schema/admin';
import { eq } from 'drizzle-orm';

@Injectable()
export class JwtAdminAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ADMIN_ACCESS_SECRET'),
      });

      const [admin] = await this.db
        .select({
          id: admins.id,
          isApproved: admins.isApproved,
        })
        .from(admins)
        .where(eq(admins.id, payload.sub));

      if (!admin || !admin.isApproved) {
        throw new UnauthorizedException('승인되지 않은 관리자입니다.');
      }

      request['admin'] = admin;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 