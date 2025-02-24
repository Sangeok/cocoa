import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleClient } from '../database/database.module';
import { Inject } from '@nestjs/common';
import { stockDiscussions } from '../database/schema/stock-discussion';
import { stockDiscussionComments } from '../database/schema/stock-discussion-comment';
import { eq, desc, and, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { users } from '../database/schema/user';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class StockDiscussionService {
  constructor(
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly notificationService: NotificationService,
  ) {}

  async getDiscussion(discussionId: number) {
    const [discussion] = await this.db
      .select()
      .from(stockDiscussions)
      .where(eq(stockDiscussions.id, discussionId));
    return discussion;
  }

  async updateComment(commentId: number, content: string) {
    const [comment] = await this.db
      .update(stockDiscussionComments)
      .set({ content })
      .where(eq(stockDiscussionComments.id, commentId))
      .returning({
        id: stockDiscussionComments.id,
        content: stockDiscussionComments.content,
        createdAt: stockDiscussionComments.createdAt,
      });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const [commentWithUser] = await this.db
      .select({
        id: stockDiscussionComments.id,
        content: stockDiscussionComments.content,
        createdAt: stockDiscussionComments.createdAt,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(stockDiscussionComments)
      .innerJoin(users, eq(users.id, stockDiscussionComments.userId))
      .where(eq(stockDiscussionComments.id, commentId));

    return commentWithUser;
  }

  async createDiscussion(userId: number, symbol: string, content: string) {
    const [discussion] = await this.db
      .insert(stockDiscussions)
      .values({
        symbol,
        authorId: userId,
        content,
      })
      .returning();

    const authorAlias = alias(users, 'author');

    const [discussionWithUser] = await this.db
      .select({
        id: stockDiscussions.id,
        content: stockDiscussions.content,
        symbol: stockDiscussions.symbol,
        createdAt: stockDiscussions.createdAt,
        updatedAt: stockDiscussions.updatedAt,
        author: {
          id: authorAlias.id,
          name: authorAlias.name,
        },
        commentCount: sql<number>`0`,
      })
      .from(stockDiscussions)
      .innerJoin(authorAlias, eq(authorAlias.id, stockDiscussions.authorId))
      .where(eq(stockDiscussions.id, discussion.id));

    return discussionWithUser;
  }

  async getDiscussions(symbol: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const authorAlias = alias(users, 'author');

    const whereConditions = [
      eq(stockDiscussions.isDeleted, false),
      eq(stockDiscussions.symbol, symbol),
    ];

    const [items, total] = await Promise.all([
      this.db
        .select({
          id: stockDiscussions.id,
          content: stockDiscussions.content,
          symbol: stockDiscussions.symbol,
          createdAt: stockDiscussions.createdAt,
          updatedAt: stockDiscussions.updatedAt,
          author: {
            id: authorAlias.id,
            name: authorAlias.name,
          },
          commentCount: sql<number>`count(${stockDiscussionComments.id})`,
        })
        .from(stockDiscussions)
        .innerJoin(authorAlias, eq(authorAlias.id, stockDiscussions.authorId))
        .leftJoin(
          stockDiscussionComments,
          eq(stockDiscussionComments.discussionId, stockDiscussions.id),
        )
        .where(and(...whereConditions))
        .groupBy(stockDiscussions.id, authorAlias.id)
        .orderBy(desc(stockDiscussions.createdAt))
        .limit(limit)
        .offset(offset),

      this.db
        .select({ count: sql<number>`count(*)` })
        .from(stockDiscussions)
        .where(and(...whereConditions)),
    ]);

    return {
      items,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }

  async getDiscussionComments(
    discussionId: number,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;
    const mentionedUsers = alias(users, 'mentioned_users');

    const [comments, total] = await Promise.all([
      this.db
        .select({
          id: stockDiscussionComments.id,
          content: stockDiscussionComments.content,
          createdAt: stockDiscussionComments.createdAt,
          user: {
            id: users.id,
            name: users.name,
          },
          mentionedUser: {
            id: mentionedUsers.id,
            name: mentionedUsers.name,
          },
        })
        .from(stockDiscussionComments)
        .innerJoin(users, eq(users.id, stockDiscussionComments.userId))
        .leftJoin(
          mentionedUsers,
          eq(mentionedUsers.id, stockDiscussionComments.mentionedUserId),
        )
        .where(eq(stockDiscussionComments.discussionId, discussionId))
        .orderBy(desc(stockDiscussionComments.createdAt))
        .offset(offset)
        .limit(limit)
        .then((results) => results.reverse()),

      this.db
        .select({ count: sql<number>`count(*)` })
        .from(stockDiscussionComments)
        .where(eq(stockDiscussionComments.discussionId, discussionId)),
    ]);

    return {
      items: comments,
      pagination: {
        total: total[0].count,
        page,
        limit,
        hasMore: total[0].count > page * limit,
      },
    };
  }

  async createComment(discussionId: number, userId: number, content: string) {
    // 1. 토론글 정보 조회
    const [discussion] = await this.db
      .select({
        authorId: stockDiscussions.authorId,
      })
      .from(stockDiscussions)
      .where(eq(stockDiscussions.id, discussionId));

    if (!discussion) throw new NotFoundException('Discussion not found');

    // 2. 댓글 생성
    const [comment] = await this.db
      .insert(stockDiscussionComments)
      .values({
        discussionId,
        userId,
        content,
      })
      .returning();

    // 3. 알림 생성 - 토론글 작성자에게만 알림 발송 (자신의 글이 아닌 경우에만)
    if (discussion.authorId !== userId) {
      await this.notificationService.create({
        userId: discussion.authorId,
        senderId: userId,
        type: 'NEW_COMMENT_STOCK_DISCUSSION',
        content: `토론글에 새로운 댓글이 달렸습니다: ${content.substring(0, 30)}...`,
        targetId: discussionId,
        targetUserId: discussion.authorId,
      });
    }

    return comment;
  }

  async deleteDiscussion(userId: number, discussionId: number) {
    const [discussion] = await this.db
      .select({
        id: stockDiscussions.id,
        authorId: stockDiscussions.authorId,
      })
      .from(stockDiscussions)
      .where(eq(stockDiscussions.id, discussionId))
      .limit(1);

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    if (discussion.authorId !== userId) {
      throw new Error('Not authorized to delete this discussion');
    }

    await this.db
      .update(stockDiscussions)
      .set({ isDeleted: true })
      .where(eq(stockDiscussions.id, discussionId));

    return { success: true };
  }

  async deleteComment(userId: number, commentId: number) {
    const [comment] = await this.db
      .select({
        id: stockDiscussionComments.id,
        discussionId: stockDiscussionComments.discussionId,
        userId: stockDiscussionComments.userId,
      })
      .from(stockDiscussionComments)
      .where(
        and(
          eq(stockDiscussionComments.id, commentId),
          eq(stockDiscussionComments.userId, userId),
        ),
      )
      .limit(1);

    if (!comment) {
      throw new NotFoundException('Comment not found or not authorized');
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(stockDiscussionComments)
        .set({ isDeleted: true })
        .where(eq(stockDiscussionComments.id, commentId));
    });

    return { success: true };
  }
}
