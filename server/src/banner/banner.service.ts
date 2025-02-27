import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleClient } from '../database/database.module';
import { banners, Banner } from '../database/schema/banner';
import { predicts } from '../database/schema/predict';
import { AwsService } from '../aws/aws.service';
import { eq, and, gte, sql } from 'drizzle-orm';

interface CreateBannerDto {
  userId: number;
  position: number;
  pages: string[];
  desktopImage: Express.Multer.File;
  tabletImage: Express.Multer.File;
  mobileImage: Express.Multer.File;
  startAt: Date;
  endAt: Date;
}

@Injectable()
export class BannerService {
  private readonly pricePerDay: number;

  constructor(
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly configService: ConfigService,
    private readonly awsService: AwsService,
  ) {
    this.pricePerDay = this.configService.get<number>(
      'BANNER_PRICE_PER_DAY',
      5000,
    );
  }

  private calculateTotalPrice(startAt: Date, endAt: Date): number {
    const days = Math.ceil(
      (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days * this.pricePerDay;
  }

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const { userId, position, pages, startAt, endAt } = createBannerDto;

    // 날짜 유효성 검사
    if (startAt <= new Date() || endAt <= startAt) {
      throw new BadRequestException('Invalid date range');
    }

    // 총 금액 계산
    const totalAmount = this.calculateTotalPrice(startAt, endAt);

    // 사용자의 잔액 확인
    const [userPredict] = await this.db
      .select({ vault: predicts.vault })
      .from(predicts)
      .where(eq(predicts.userId, userId));

    if (
      !userPredict ||
      parseFloat(userPredict.vault.toString()) < totalAmount
    ) {
      throw new BadRequestException('Insufficient funds');
    }

    // 이미지 업로드
    const [desktopImageUrl, tabletImageUrl, mobileImageUrl] = await Promise.all(
      [
        this.awsService.uploadImage(
          createBannerDto.desktopImage,
          'banners/desktop',
        ),
        this.awsService.uploadImage(
          createBannerDto.tabletImage,
          'banners/tablet',
        ),
        this.awsService.uploadImage(
          createBannerDto.mobileImage,
          'banners/mobile',
        ),
      ],
    );

    // 트랜잭션으로 배너 생성과 잔액 차감을 동시에 처리
    const [banner] = await this.db.transaction(async (tx) => {
      // 배너 생성
      const [newBanner] = await tx
        .insert(banners)
        .values({
          userId: userId,
          position: position,
          pages,
          desktopImageUrl,
          tabletImageUrl,
          mobileImageUrl,
          amount: totalAmount.toString(),
          startAt,
          endAt,
          registeredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // 잔액 차감
      await tx
        .update(predicts)
        .set({
          vault: sql`${predicts.vault} - ${totalAmount}`,
        })
        .where(eq(predicts.userId, userId));

      return [newBanner];
    });

    return banner;
  }

  async findById(id: number): Promise<Banner | undefined> {
    const [banner] = await this.db
      .select()
      .from(banners)
      .where(eq(banners.id, id));
    return banner;
  }

  async findActive(page: string): Promise<Banner[]> {
    const now = new Date();
    return this.db
      .select()
      .from(banners)
      .where(
        and(
          sql`${banners.pages} @> ARRAY[${page}]::text[]`,
          eq(banners.isApproved, true),
          gte(banners.endAt, now),
          sql`${banners.startAt} <= NOW()`,
        ),
      )
      .orderBy(banners.position);
  }

  async approve(id: number): Promise<Banner> {
    const [banner] = await this.db
      .update(banners)
      .set({
        isApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, id))
      .returning();

    return banner;
  }

  async delete(userId: number, id: number): Promise<void> {
    const [banner] = await this.db
      .select()
      .from(banners)
      .where(eq(banners.id, id));

    if (!banner || banner.userId !== userId) {
      throw new BadRequestException('Banner not found or unauthorized');
    }

    // 이미지 삭제
    await Promise.all([
      this.awsService.deleteImage(banner.desktopImageUrl),
      this.awsService.deleteImage(banner.tabletImageUrl),
      this.awsService.deleteImage(banner.mobileImageUrl),
    ]);

    // 배너가 시작되지 않았다면 환불
    if (banner.startAt > new Date() && banner.isApproved) {
      await this.db.transaction(async (tx) => {
        await tx
          .update(predicts)
          .set({
            vault: sql`${predicts.vault} + ${banner.amount}`,
          })
          .where(eq(predicts.userId, userId));

        await tx.delete(banners).where(eq(banners.id, id));
      });
    } else {
      await this.db.delete(banners).where(eq(banners.id, id));
    }
  }
}
