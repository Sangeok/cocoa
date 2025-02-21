import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GuestbookService } from './guestbook.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Get()
  async getGuestbooks(
    @Query('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Req() req: Request & { user?: { id: number } },
  ) {
    return {
      success: true,
      data: await this.guestbookService.getGuestbooks(
        parseInt(userId),
        parseInt(page),
        parseInt(limit),
        req.user?.id,
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createGuestbook(
    @Body('content') content: string,
    @Body('targetUserId') targetUserId: string,
    @Body('isSecret') isSecret: boolean = false,
    @Req() req: Request & { user: { id: number } },
  ) {
    return {
      success: true,
      data: await this.guestbookService.createGuestbook(
        req.user.id,
        parseInt(targetUserId),
        content,
        isSecret,
      ),
    };
  }

  @Get(':guestbookId/comments')
  async getComments(
    @Param('guestbookId') guestbookId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Req() req: Request & { user?: { id: number } },
  ) {
    return {
      success: true,
      data: await this.guestbookService.getGuestbookComments(
        parseInt(guestbookId),
        parseInt(page),
        parseInt(limit),
        req.user?.id,
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':guestbookId/comments')
  async createComment(
    @Param('guestbookId') guestbookId: string,
    @Body('content') content: string,
    @Body('isSecret') isSecret: boolean = false,
    @Req() req: Request & { user: { id: number } },
  ) {
    return {
      success: true,
      data: await this.guestbookService.createComment(
        parseInt(guestbookId),
        req.user.id,
        content,
        isSecret,
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':guestbookId')
  async deleteGuestbook(
    @Param('guestbookId') guestbookId: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    return {
      success: true,
      data: await this.guestbookService.deleteGuestbook(
        req.user.id,
        parseInt(guestbookId),
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    return {
      success: true,
      data: await this.guestbookService.deleteComment(
        req.user.id,
        parseInt(commentId),
      ),
    };
  }
} 