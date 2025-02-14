import { Injectable, Inject } from '@nestjs/common';
import { DrizzleClient } from '../database/database.module';
import { users, User, NewUser } from '../database/schema/user';
import { predicts } from '../database/schema/predict';
import { eq } from 'drizzle-orm';

export interface UserWithPredict extends User {
  predict: typeof predicts.$inferSelect | null;
}

@Injectable()
export class UserService {
  constructor(@Inject('DATABASE') private readonly db: typeof DrizzleClient) {}

  async findBySocialId(socialId: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.socialId, socialId));

    return user;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return user;
  }

  async findById(id: number): Promise<UserWithPredict | undefined> {
    const [result] = await this.db
      .select({
        id: users.id,
        socialId: users.socialId,
        email: users.email,
        name: users.name,
        phoneNumber: users.phoneNumber,
        provider: users.provider,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        predict: predicts,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .leftJoin(predicts, eq(users.id, predicts.userId));

    return result;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  async update(
    id: number,
    data: Partial<Omit<NewUser, 'id' | 'socialId'>>,
  ): Promise<User> {
    const [user] = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  async findAll(): Promise<User[]> {
    return this.db.select().from(users);
  }
}
