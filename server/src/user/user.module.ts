import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { RedisService } from '../redis/redis.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    ConfigModule,
    AdminModule,
  ],
  controllers: [UserController],
  providers: [UserService, RedisService],
  exports: [UserService],
})
export class UserModule {}
