import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Req() req: Request & { user: { id: number } },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return {
      success: true,
      data: await this.notificationService.getNotifications(
        req.user.id,
        parseInt(page),
        parseInt(limit),
      ),
    };
  }

  @Get('unread')
  async getUnreadCount(@Req() req: Request & { user: { id: number } }) {
    return {
      success: true,
      data: await this.notificationService.getUnreadCount(req.user.id),
    };
  }

  @Patch('read/:id')
  async markAsRead(
    @Req() req: Request & { user: { id: number } },
    @Param('id') notificationId: string,
  ) {
    await this.notificationService.markAsRead(
      req.user.id,
      parseInt(notificationId),
    );
    return { success: true };
  }

  @Post('read-all')
  async markAllAsRead(@Req() req: Request & { user: { id: number } }) {
    await this.notificationService.markAsRead(req.user.id);
    return { success: true };
  }

  @Delete(':id')
  async delete(
    @Req() req: Request & { user: { id: number } },
    @Param('id') notificationId: string,
  ) {
    await this.notificationService.delete(
      req.user.id,
      parseInt(notificationId),
    );
    return { success: true };
  }
}
