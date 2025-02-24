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
  Patch,
} from '@nestjs/common';
import { StockDiscussionService } from './stock-discussion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('stock-discussion')
export class StockDiscussionController {
  constructor(private readonly stockDiscussionService: StockDiscussionService) {}

  @Get()
  async getDiscussions(
    @Query('symbol') symbol: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return {
      success: true,
      data: await this.stockDiscussionService.getDiscussions(
        symbol,
        parseInt(page),
        parseInt(limit),
      ),
    };
  }

  @Get('/get/:discussionId')
  async getDiscussion(@Param('discussionId') discussionId: string) {
    return {
      success: true,
      data: await this.stockDiscussionService.getDiscussion(parseInt(discussionId)),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createDiscussion(
    @Body('content') content: string,
    @Body('symbol') symbol: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    return {
      success: true,
      data: await this.stockDiscussionService.createDiscussion(
        req.user.id,
        symbol,
        content,
      ),
    };
  }

  @Get(':discussionId/comments')
  async getComments(
    @Param('discussionId') discussionId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return {
      success: true,
      data: await this.stockDiscussionService.getDiscussionComments(
        parseInt(discussionId),
        parseInt(page),
        parseInt(limit),
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':discussionId/comments')
  async createComment(
    @Param('discussionId') discussionId: string,
    @Body('content') content: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    return {
      success: true,
      data: await this.stockDiscussionService.createComment(
        parseInt(discussionId),
        req.user.id,
        content,
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':discussionId')
  async deleteDiscussion(
    @Param('discussionId') discussionId: string,
    @Req() req: Request & { user: { id: number } },
  ) {
    return {
      success: true,
      data: await this.stockDiscussionService.deleteDiscussion(
        req.user.id,
        parseInt(discussionId),
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('comments/:commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body('content') content: string,
  ) {
    return {
      success: true,
      data: await this.stockDiscussionService.updateComment(
        parseInt(commentId),
        content,
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
      data: await this.stockDiscussionService.deleteComment(
        req.user.id,
        parseInt(commentId),
      ),
    };
  }
} 