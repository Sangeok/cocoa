import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DrizzleClient } from '../database/database.module';
import { messages, Message } from '../database/schema/message';
import { eq, desc, sql, and, ilike, or } from 'drizzle-orm';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationService } from '../notification/notification.service';
import { users } from '../database/schema/user';
import { SQL } from 'drizzle-orm';

interface FindMessagesOptions {
  page?: number;
  limit?: number;
  isRead?: boolean;
  search?: string; // 사용자 이름이나 이메일로 검색
}

@Injectable()
export class MessageService {
  constructor(
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    adminId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    // adminId가 제대로 들어오는지 확인
    if (!adminId) {
      throw new Error('관리자 ID가 필요합니다');
    }

    const [message] = await this.db
      .insert(messages)
      .values({
        adminId,  // 명시적으로 adminId 할당
        userId: createMessageDto.userId,
        title: createMessageDto.title,
        content: createMessageDto.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 메시지 생성 후 알림 생성
    await this.notificationService.create({
      userId: createMessageDto.userId,
      senderId: adminId,
      type: 'NEW_ADMIN_MESSAGE',
      content: `새로운 메시지: ${createMessageDto.title}`,
      targetId: message.id,
      targetUserId: createMessageDto.userId,
    });

    return message;
  }

  async findUserMessages(userId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [messageList, [{ count }]] = await Promise.all([
      this.db
        .select()
        .from(messages)
        .where(eq(messages.userId, userId))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(messages.createdAt)),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(eq(messages.userId, userId)),
    ]);

    return {
      messages: messageList,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async markAsRead(userId: number, messageId: number): Promise<void> {
    const [message] = await this.db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (!message || message.userId !== userId) {
      throw new NotFoundException('Message not found');
    }

    await this.db
      .update(messages)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));
  }

  async findAdminMessages(options: FindMessagesOptions = {}) {
    const { page = 1, limit = 10, isRead, search } = options;

    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];

    // isRead 필터 조건 추가
    if (typeof isRead === 'boolean') {
      conditions.push(eq(messages.isRead, isRead) as SQL);
    }

    // 검색 조건 추가
    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
        ) as SQL,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [messageList, [{ count }]] = await Promise.all([
      this.db
        .select({
          message: messages,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(messages)
        .innerJoin(users, eq(messages.userId, users.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(messages.createdAt)),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .innerJoin(users, eq(messages.userId, users.id))
        .where(whereClause),
    ]);

    return {
      messages: messageList,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}
