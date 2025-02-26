import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAdminAuthGuard } from '../admin/guards/jwt-auth.guard';
import { JwtAuthGuard as UserJwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentAdmin } from '../admin/decorators/current-admin.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAdminAuthGuard)
  @Post()
  async create(
    @CurrentAdmin() admin: { id: number },
    @Body() createMessageDto: CreateMessageDto,
  ) {
    try {
      console.log('Current Admin:', admin);
      
      if (!admin?.id) {
        throw new Error('관리자 인증이 필요합니다');
      }

      const message = await this.messageService.create(
        admin.id,
        createMessageDto,
      );
      return {
        success: true,
        data: message,
      };
    } catch (error) {
      console.error('Message creation error:', error);
      return {
        success: false,
        message: error.message || '메시지 생성에 실패했습니다',
      };
    }
  }

  @UseGuards(UserJwtAuthGuard)
  @Get()
  async getUserMessages(
    @CurrentUser() userId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    try {
      const result = await this.messageService.findUserMessages(
        userId,
        parseInt(page),
        parseInt(limit),
      );
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

  @UseGuards(UserJwtAuthGuard)
  @Patch(':messageId/read')
  async markAsRead(
    @CurrentUser() userId: number,
    @Param('messageId') messageId: string,
  ) {
    try {
      await this.messageService.markAsRead(userId, parseInt(messageId));
      return {
        success: true,
        message: 'Message marked as read',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('admin')
  async getAdminMessages(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('isRead') isRead?: string,
    @Query('search') search?: string,
  ) {
    try {
      let isReadFilter: boolean | undefined;
      if (isRead === 'true') isReadFilter = true;
      if (isRead === 'false') isReadFilter = false;

      const result = await this.messageService.findAdminMessages({
        page: parseInt(page),
        limit: parseInt(limit),
        isRead: isReadFilter,
        search,
      });

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
}
