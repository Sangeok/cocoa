import { Injectable, Inject } from '@nestjs/common';
import { DrizzleClient } from '../database/database.module';
import {
  notifications,
  NotificationType,
} from '../database/schema/notification';
import { users } from '../database/schema/user';
import { eq, desc, and, sql } from 'drizzle-orm';
import { AppGateway } from '../gateway/app.gateway';

interface CreateNotificationDto {
  userId: number;
  senderId: number;
  type: NotificationType;
  content: string;
  targetId: number;
  targetUserId: number;
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly appGateway: AppGateway,
  ) {}

  async create(data: CreateNotificationDto) {
    const [notification] = await this.db
      .insert(notifications)
      .values(data)
      .returning();

    // 실시간 알림 전송
    this.appGateway.server
      .to(`user:${data.userId}`)
      .emit('notification', notification);

    return notification;
  }

  async getNotifications(userId: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.db
        .select({
          id: notifications.id,
          type: notifications.type,
          content: notifications.content,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
          targetId: notifications.targetId,
          sender: {
            id: users.id,
            name: users.name,
          },
        })
        .from(notifications)
        .innerJoin(users, eq(users.id, notifications.senderId))
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isDeleted, false),
          ),
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isDeleted, false),
          ),
        ),
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

  async getUnreadCount(userId: number) {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          eq(notifications.isDeleted, false),
        ),
      );

    return result.count;
  }

  async markAsRead(userId: number, notificationId?: number) {
    if (notificationId) {
      // 특정 알림만 읽음 처리
      await this.db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId),
          ),
        );
    } else {
      // 모든 알림 읽음 처리
      await this.db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId));
    }
  }

  async delete(userId: number, notificationId: number) {
    await this.db
      .update(notifications)
      .set({ isDeleted: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId),
        ),
      );
  }
}
