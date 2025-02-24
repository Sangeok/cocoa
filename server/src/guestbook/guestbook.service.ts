import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleClient } from '../database/database.module';
import { Inject } from '@nestjs/common';
import { guestbooks } from '../database/schema/guestbook';
import { guestbookComments } from '../database/schema/guestbook-comment';
import { eq, desc, and, sql, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { users } from '../database/schema/user';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class GuestbookService {
  constructor(
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly notificationService: NotificationService,
  ) {}

  async getGuestbook(guestbookId: number) {
    const [guestbook] = await this.db
      .select()
      .from(guestbooks)
      .where(eq(guestbooks.id, guestbookId));
    return guestbook;
  }

  async updateComment(commentId: number, content: string) {
    const [comment] = await this.db
      .update(guestbookComments)
      .set({ content })
      .where(eq(guestbookComments.id, commentId))
      .returning({
        id: guestbookComments.id,
        content: guestbookComments.content,
        createdAt: guestbookComments.createdAt,
        isSecret: guestbookComments.isSecret,
      });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // 작성자 정보를 별도로 조회
    const [commentWithUser] = await this.db
      .select({
        id: guestbookComments.id,
        content: guestbookComments.content,
        createdAt: guestbookComments.createdAt,
        isSecret: guestbookComments.isSecret,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(guestbookComments)
      .innerJoin(users, eq(users.id, guestbookComments.userId))
      .where(eq(guestbookComments.id, commentId));

    return commentWithUser;
  }

  async createGuestbook(
    userId: number, // 방명록을 작성한 사용자 아이디
    targetUserId: number, // 방명록의 대상이 되는 사용자 아이디
    content: string,
    isSecret: boolean = false,
  ) {
    // 자신의 방명록에는 비밀글을 쓸 수 없음
    if (userId === targetUserId && isSecret) {
      throw new BadRequestException(
        'Cannot write secret guestbook on your own profile',
      );
    }

    const [guestbook] = await this.db
      .insert(guestbooks)
      .values({
        userId: targetUserId,
        authorId: userId,
        targetUserId: targetUserId,
        content,
        isSecret,
      })
      .returning();

    const authorAlias = alias(users, 'author'); // 별칭 테이블 정의

    // 생성된 방명록과 작성자 정보를 함께 조회
    const [guestbookWithUser] = await this.db
      .select({
        id: guestbooks.id,
        content: guestbooks.content,
        createdAt: guestbooks.createdAt,
        updatedAt: guestbooks.updatedAt,
        userId: guestbooks.userId,
        user: {
          id: users.id,
          name: users.name,
        },
        author: {
          id: authorAlias.id,
          name: authorAlias.name,
        },
        commentCount: sql<number>`0`,
        isSecret: guestbooks.isSecret,
      })
      .from(guestbooks)
      .innerJoin(users, eq(users.id, guestbooks.userId))
      .innerJoin(authorAlias, eq(authorAlias.id, guestbooks.authorId))
      .where(eq(guestbooks.id, guestbook.id));

    // 방명록 작성 알림 생성 (자신의 방명록에 쓸 때는 제외)
    if (userId !== targetUserId) {
      console.log('Creating notification:', {
        userId: targetUserId, // 방명록 주인 (알림을 받을 사람)
        senderId: userId, // 방명록 작성자 (알림을 발생시킨 사람)
        type: 'NEW_GUESTBOOK',
        content: `새로운 방명록이 작성되었습니다: ${content.substring(0, 30)}...`,
        targetId: guestbook.id,
      });

      await this.notificationService.create({
        userId: targetUserId, // 방명록 주인에게 알림이 가야 함
        senderId: userId, // 방명록 작성자가 발신자
        type: 'NEW_GUESTBOOK',
        content: `새로운 방명록이 작성되었습니다: ${content.substring(0, 30)}...`,
        targetId: guestbook.id,
        targetUserId: guestbook.targetUserId,
      });
    }

    return guestbookWithUser;
  }

  async getGuestbooks(
    targetUserId: number,
    page: number = 1,
    limit: number = 10,
    viewerId?: number,
  ) {
    const offset = (page - 1) * limit;
    const authorAlias = alias(users, 'author');

    // 삭제된 방명록만 제외
    const whereConditions = [
      eq(guestbooks.isDeleted, false),
      eq(guestbooks.userId, targetUserId),
    ];

    const [items, total] = await Promise.all([
      this.db
        .select({
          id: guestbooks.id,
          content: guestbooks.content,
          createdAt: guestbooks.createdAt,
          updatedAt: guestbooks.updatedAt,
          userId: guestbooks.userId,
          user: {
            id: users.id,
            name: users.name,
          },
          author: {
            id: authorAlias.id,
            name: authorAlias.name,
          },
          commentCount: sql<number>`count(${guestbookComments.id})`,
          isSecret: guestbooks.isSecret,
        })
        .from(guestbooks)
        .innerJoin(users, eq(users.id, guestbooks.userId))
        .innerJoin(authorAlias, eq(authorAlias.id, guestbooks.authorId))
        .leftJoin(
          guestbookComments,
          eq(guestbookComments.guestbookId, guestbooks.id),
        )
        .where(and(...whereConditions))
        .groupBy(guestbooks.id, users.id, authorAlias.id)
        .orderBy(desc(guestbooks.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(guestbooks)
        .where(and(...whereConditions)),
    ]);

    // 방명록 내용 처리
    const processedItems = items.map((item) => {
      if (!item.isSecret) return item;

      // 비밀 방명록인 경우
      if (!viewerId) {
        // 비로그인 사용자
        return {
          ...item,
          content: '비공개 방명록입니다.',
          author: {
            ...item.author,
            name: '비공개',
          },
        };
      }

      // 로그인 사용자가 방명록 주인이거나 작성자인 경우 원본 내용 유지
      if (viewerId === targetUserId || viewerId === item.author.id) {
        return item;
      }

      // 그 외의 경우 내용 가림
      return {
        ...item,
        content: '비공개 방명록입니다.',
        author: {
          ...item.author,
          name: '비공개',
        },
      };
    });

    return {
      items: processedItems,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }

  async getGuestbookComments(guestbookId: number, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const mentionedUsers = alias(users, 'mentioned_users');

    const [comments, total] = await Promise.all([
      this.db
        .select({
          id: guestbookComments.id,
          content: guestbookComments.content,
          createdAt: guestbookComments.createdAt,
          isSecret: guestbookComments.isSecret,
          user: {
            id: users.id,
            name: users.name,
          },
          mentionedUser: {
            id: mentionedUsers.id,
            name: mentionedUsers.name,
          },
        })
        .from(guestbookComments)
        .innerJoin(users, eq(users.id, guestbookComments.userId))
        .leftJoin(
          mentionedUsers,
          eq(mentionedUsers.id, guestbookComments.mentionedUserId),
        )
        .where(eq(guestbookComments.guestbookId, guestbookId))
        .orderBy(desc(guestbookComments.createdAt)) // 최신순으로 정렬
        .offset(offset)
        .limit(limit)
        .then((results) => results.reverse()), // 결과만 역순으로 변환

      this.db
        .select({ count: sql<number>`count(*)` })
        .from(guestbookComments)
        .where(eq(guestbookComments.guestbookId, guestbookId)),
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

  async createComment(
    guestbookId: number,
    userId: number,
    content: string,
    isSecret: boolean,
  ) {
    // 1. 방명록 정보 조회
    const [guestbook] = await this.db
      .select({
        authorId: guestbooks.authorId, // 방명록 작성자
        targetUserId: guestbooks.targetUserId, // 방명록 주인
      })
      .from(guestbooks)
      .where(eq(guestbooks.id, guestbookId));

    if (!guestbook) throw new NotFoundException('Guestbook not found');

    // 2. 댓글 생성
    const [comment] = await this.db
      .insert(guestbookComments)
      .values({
        guestbookId,
        userId,
        content,
        isSecret,
      })
      .returning();

    // 3. 알림 생성 - 방명록 작성자에게만 알림 발송 (자신의 방명록이 아닌 경우에만)
    if (guestbook.authorId !== userId) {
      await this.notificationService.create({
        userId: guestbook.authorId, // 알림 수신자 (방명록 작성자)
        senderId: userId, // 알림 발신자 (댓글 작성자)
        type: 'NEW_COMMENT',
        content: `방명록에 새로운 댓글이 달렸습니다.`,
        targetId: guestbookId,
        targetUserId: guestbook.targetUserId,
      });
    }

    return comment;
  }

  async deleteGuestbook(userId: number, guestbookId: number) {
    const [guestbook] = await this.db
      .select({
        id: guestbooks.id,
        userId: guestbooks.userId,
        authorId: guestbooks.authorId,
      })
      .from(guestbooks)
      .where(eq(guestbooks.id, guestbookId))
      .limit(1);

    if (!guestbook) {
      throw new NotFoundException('Guestbook not found');
    }

    // 방명록 소유자이거나 작성자만 삭제 가능
    if (guestbook.userId !== userId && guestbook.authorId !== userId) {
      throw new Error('Not authorized to delete this guestbook');
    }

    await this.db
      .update(guestbooks)
      .set({ isDeleted: true })
      .where(eq(guestbooks.id, guestbookId));

    return { success: true };
  }

  async deleteComment(userId: number, commentId: number) {
    const [comment] = await this.db
      .select({
        id: guestbookComments.id,
        guestbookId: guestbookComments.guestbookId,
        userId: guestbookComments.userId,
      })
      .from(guestbookComments)
      .where(
        and(
          eq(guestbookComments.id, commentId),
          eq(guestbookComments.userId, userId),
        ),
      )
      .limit(1);

    if (!comment) {
      throw new NotFoundException('Comment not found or not authorized');
    }

    // 트랜잭션으로 처리
    await this.db.transaction(async (tx) => {
      // 댓글 삭제
      await tx
        .update(guestbookComments)
        .set({ isDeleted: true })
        .where(eq(guestbookComments.id, commentId));

      // 방명록의 댓글 수 감소
      await tx.execute(
        sql`UPDATE guestbooks 
            SET comment_count = comment_count - 1 
            WHERE id = ${comment.guestbookId}`,
      );
    });

    return { success: true };
  }
}
