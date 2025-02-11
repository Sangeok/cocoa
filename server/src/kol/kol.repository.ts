import { Injectable, Inject } from '@nestjs/common';
import { DrizzleClient } from '../database/database.module';
import { kols, type KOL, type NewKOL } from '../database/schema/kol';
import { eq } from 'drizzle-orm';

@Injectable()
export class KolRepository {
  constructor(@Inject('DATABASE') private readonly db: typeof DrizzleClient) {}

  async findAll(): Promise<KOL[]> {
    return this.db.select().from(kols).execute();
  }

  async findOne(id: string): Promise<KOL | null> {
    const result = await this.db
      .select()
      .from(kols)
      .where(eq(kols.id, id))
      .execute();

    return result[0] || null;
  }

  async create(data: NewKOL): Promise<void> {
    await this.db.insert(kols).values(data).execute();
  }

  async update(id: string, data: Partial<KOL>): Promise<void> {
    await this.db.update(kols).set(data).where(eq(kols.id, id)).execute();
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(kols).where(eq(kols.id, id)).execute();
  }
}
