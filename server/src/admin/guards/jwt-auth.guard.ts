import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DrizzleClient } from '../../database/database.module';
import { Inject } from '@nestjs/common';
import { admins } from '../../database/schema/admin';
import { eq } from 'drizzle-orm';

@Injectable()
export class JwtAdminAuthGuard extends AuthGuard('jwt-admin') {
  constructor(
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Strategy 검증 수행
    const result = (await super.canActivate(context)) as boolean;
    if (!result) {
      return false;
    }

    // admin 검증
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const [admin] = await this.db
      .select({
        id: admins.id,
        isApproved: admins.isApproved,
      })
      .from(admins)
      .where(eq(admins.id, user.id));

    if (!admin || !admin.isApproved) {
      throw new UnauthorizedException('승인되지 않은 관리자입니다.');
    }

    request['admin'] = admin;
    return true;
  }
} 