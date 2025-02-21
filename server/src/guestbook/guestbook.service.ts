import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async createGuestbook(userId: number, targetUserId: number, content: string, isSecret: boolean = false) {
    // 자신의 방명록에는 비밀글을 쓸 수 없음
    if (userId === targetUserId && isSecret) {
      throw new BadRequestException('Cannot write secret guestbook on your own profile');
    }

    const [guestbook] = await this.db
      .insert(guestbooks)
      .values({
        userId: targetUserId,
        authorId: userId,
        content,
        isSecret,
      })
      .returning();

    const authorAlias = alias(users, 'author');  // 별칭 테이블 정의

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
      .innerJoin(
        authorAlias,
        eq(authorAlias.id, guestbooks.authorId)
      )
      .where(eq(guestbooks.id, guestbook.id));

    // 방명록 작성 알림 생성 (자신의 방명록에 쓸 때는 제외)
    if (userId !== targetUserId) {
      console.log('Creating notification:', {
        userId: targetUserId,    // 방명록 주인 (알림을 받을 사람)
        senderId: userId,        // 방명록 작성자 (알림을 발생시킨 사람)
        type: 'NEW_GUESTBOOK',
        content: `새로운 방명록이 작성되었습니다: ${content.substring(0, 30)}...`,
        targetId: guestbook.id,
      });
      
      await this.notificationService.create({
        userId: targetUserId,    // 방명록 주인에게 알림이 가야 함
        senderId: userId,        // 방명록 작성자가 발신자
        type: 'NEW_GUESTBOOK',
        content: `새로운 방명록이 작성되었습니다: ${content.substring(0, 30)}...`,
        targetId: guestbook.id,
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
        .leftJoin(guestbookComments, eq(guestbookComments.guestbookId, guestbooks.id))
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
    const processedItems = items.map(item => {
      if (!item.isSecret) return item;

      // 비밀 방명록인 경우
      if (!viewerId) {
        // 비로그인 사용자
        return {
          ...item,
          content: "비공개 방명록입니다.",
          author: {
            ...item.author,
            name: "비공개",
          }
        };
      }

      // 로그인 사용자가 방명록 주인이거나 작성자인 경우 원본 내용 유지
      if (viewerId === targetUserId || viewerId === item.author.id) {
        return item;
      }

      // 그 외의 경우 내용 가림
      return {
        ...item,
        content: "비공개 방명록입니다.",
        author: {
          ...item.author,
          name: "비공개",
        }
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

  async getGuestbookComments(
    guestbookId: number,
    page: number = 1,
    limit: number = 10,
    viewerId?: number,
  ) {
    const offset = (page - 1) * limit;
    const mentionedUsers = alias(users, 'mentioned_users');

    // 삭제된 댓글만 제외
    const whereConditions = [
      eq(guestbookComments.guestbookId, guestbookId),
      eq(guestbookComments.isDeleted, false),
    ];

    // 방명록 소유자 정보 조회
    const [guestbook] = await this.db
      .select({
        id: guestbooks.id,
        userId: guestbooks.userId,
      })
      .from(guestbooks)
      .where(eq(guestbooks.id, guestbookId))
      .limit(1);

    if (!guestbook) {
      throw new NotFoundException('Guestbook not found');
    }

    const [comments, total] = await Promise.all([
      this.db
        .select({
          id: guestbookComments.id,
          content: guestbookComments.content,
          createdAt: guestbookComments.createdAt,
          updatedAt: guestbookComments.updatedAt,
          user: {
            id: users.id,
            name: users.name,
          },
          mentionedUser: {
            id: mentionedUsers.id,
            name: mentionedUsers.name,
          },
          isSecret: guestbookComments.isSecret,
        })
        .from(guestbookComments)
        .innerJoin(users, eq(users.id, guestbookComments.userId))
        .leftJoin(
          mentionedUsers,
          eq(guestbookComments.mentionedUserId, mentionedUsers.id),
        )
        .where(and(...whereConditions))
        .orderBy(desc(guestbookComments.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(guestbookComments)
        .where(and(...whereConditions)),
    ]);

    // 댓글 내용 처리
    const processedComments = comments.map(comment => {
      if (!comment.isSecret) return comment;

      // 비밀 댓글인 경우
      if (!viewerId) {
        return {
          ...comment,
          content: "비밀 댓글입니다.",
          user: {
            ...comment.user,
            name: "비공개",
          }
        };
      }

      // 로그인 사용자가 방명록 주인이거나 댓글 작성자인 경우 원본 내용 유지
      if (viewerId === guestbook.userId || viewerId === comment.user.id) {
        return comment;
      }

      // 그 외의 경우 내용 가림
      return {
        ...comment,
        content: "비밀 댓글입니다.",
        user: {
          ...comment.user,
          name: "비공개",
        }
      };
    });

    return {
      items: processedComments,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }

  async createComment(guestbookId: number, userId: number, content: string, isSecret: boolean = false) {
    const [guestbook] = await this.db
      .select({
        id: guestbooks.id,
        userId: guestbooks.userId,
      })
      .from(guestbooks)
      .where(eq(guestbooks.id, guestbookId))
      .limit(1);

    if (!guestbook) {
      throw new NotFoundException('Guestbook not found');
    }

    if (guestbook.userId !== userId) {
      throw new Error('Only guestbook owner can comment');
    }

    // Extract mentioned username from content
    const mentionMatch = content.match(/^@(\S+)\s/);
    let mentionedUserId: number | null = null;

    if (mentionMatch) {
      const mentionedName = mentionMatch[1];
      const [mentionedUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.name, mentionedName))
        .limit(1);

      if (mentionedUser) {
        mentionedUserId = mentionedUser.id;
        // Remove mention from content
        content = content.replace(/^@\S+\s/, '');
      }
    }

    const [comment] = await this.db
      .insert(guestbookComments)
      .values({
        guestbookId,
        userId,
        content,
        mentionedUserId,
        isSecret,
      })
      .returning();

    // 댓글 작성자 정보 조회
    const [commentWithUser] = await this.db
      .select({
        id: guestbookComments.id,
        content: guestbookComments.content,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(guestbookComments)
      .innerJoin(users, eq(users.id, guestbookComments.userId))
      .where(eq(guestbookComments.id, comment.id));

    // Create notification for mentioned user if exists
    if (mentionedUserId) {
      await this.notificationService.create({
        userId: mentionedUserId,
        senderId: userId,
        type: 'NEW_COMMENT',
        content: `${commentWithUser.user.name}님이 회원님을 멘션했습니다: ${content.substring(0, 30)}...`,
        targetId: comment.id,
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
            WHERE id = ${comment.guestbookId}`
      );
    });

    return { success: true };
  }
}
