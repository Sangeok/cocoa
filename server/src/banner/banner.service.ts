import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleClient } from '../database/database.module';
import {
  banners,
  Banner,
  bannerItems,
  BannerItem,
} from '../database/schema/banner';
import { predicts } from '../database/schema/predict';
import { AwsService } from '../aws/aws.service';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

interface CreateBannerDto {
  userId: number;
  bannerItemId: number;
  image: Express.Multer.File;
  forwardUrl: string;
  startAt: Date;
  endAt: Date;
  paymentType: 'cash' | 'cocoaMoney';
}

interface CreateBannerItemDto {
  routePath: string;
  previewImage: Express.Multer.File;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  position: 'top' | 'middle' | 'bottom';
  recommendedImageSize: string;
  pricePerDay: number;
  cocoaMoneyPerDay: number;
}

interface BannerWithItem extends Banner {
  bannerItem: BannerItem;
}

@Injectable()
export class BannerService {
  constructor(
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly configService: ConfigService,
    private readonly awsService: AwsService,
  ) {}

  private calculateTotalPrice(
    startAt: Date,
    endAt: Date,
    pricePerDay: number,
  ): number {
    const days = Math.ceil(
      (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days * pricePerDay;
  }

  private calculateTotalCocoaMoney(
    startAt: Date,
    endAt: Date,
    cocoaMoneyPerDay: number,
  ): number {
    const days = Math.ceil(
      (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days * cocoaMoneyPerDay;
  }

  async createBannerItem(
    createBannerItemDto: CreateBannerItemDto,
  ): Promise<BannerItem> {
    const previewImageUrl = await this.awsService.uploadImage(
      createBannerItemDto.previewImage,
      'banners/preview',
    );

    const [bannerItem] = await this.db
      .insert(bannerItems)
      .values({
        routePath: createBannerItemDto.routePath,
        previewImageUrl,
        deviceType: createBannerItemDto.deviceType,
        position: createBannerItemDto.position,
        recommendedImageSize: createBannerItemDto.recommendedImageSize,
        pricePerDay: createBannerItemDto.pricePerDay.toString(),
        cocoaMoneyPerDay: createBannerItemDto.cocoaMoneyPerDay.toString(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return bannerItem;
  }

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const { userId, bannerItemId, startAt, endAt, forwardUrl, paymentType } =
      createBannerDto;

    // 날짜 유효성 검사
    if (startAt <= new Date() || endAt <= startAt) {
      throw new BadRequestException('Invalid date range');
    }

    // 배너 아이템 조회
    const [bannerItem] = await this.db
      .select()
      .from(bannerItems)
      .where(
        and(eq(bannerItems.id, bannerItemId), eq(bannerItems.isActive, true)),
      );

    if (!bannerItem) {
      throw new BadRequestException('Banner item not found or inactive');
    }

    // 결제 금액 계산
    const amount = paymentType === 'cocoaMoney'
      ? this.calculateTotalCocoaMoney(
          startAt,
          endAt,
          parseFloat(bannerItem.cocoaMoneyPerDay.toString()),
        )
      : this.calculateTotalPrice(
          startAt,
          endAt,
          parseFloat(bannerItem.pricePerDay.toString()),
        );

    // 코코아 머니로 결제하는 경우에만 잔액 확인
    if (paymentType === 'cocoaMoney') {
      const [userPredict] = await this.db
        .select({ vault: predicts.vault })
        .from(predicts)
        .where(eq(predicts.userId, userId));

      if (
        !userPredict ||
        parseFloat(userPredict.vault.toString()) < amount
      ) {
        throw new BadRequestException('Insufficient funds');
      }
    }

    // 이미지 업로드
    const imageUrl = await this.awsService.uploadImage(
      createBannerDto.image,
      `banners/${bannerItem.deviceType}`,
    );

    // 트랜잭션으로 배너 생성과 잔액 차감을 동시에 처리
    const [banner] = await this.db.transaction(async (tx) => {
      // 배너 생성
      const [newBanner] = await tx
        .insert(banners)
        .values({
          userId,
          bannerItemId,
          imageUrl,
          forwardUrl,
          amount: amount.toString(),
          startAt,
          endAt,
          isApproved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // 코코아 머니로 결제하는 경우에만 잔액 차감
      if (paymentType === 'cocoaMoney') {
        await tx
          .update(predicts)
          .set({
            vault: sql`${predicts.vault} - ${amount}`,
          })
          .where(eq(predicts.userId, userId));
      }

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

  async findActive(routePath: string): Promise<BannerWithItem[]> {
    const now = new Date();
    const results = await this.db
      .select()
      .from(banners)
      .innerJoin(bannerItems, eq(banners.bannerItemId, bannerItems.id))
      .where(
        and(
          eq(bannerItems.routePath, routePath),
          eq(banners.isApproved, true),
          eq(bannerItems.isActive, true),
          gte(banners.endAt, now),
          sql`${banners.startAt} <= NOW()`,
        ),
      )
      .orderBy(bannerItems.position);

    return results.map((row) => ({
      ...row.banners,
      bannerItem: row.banner_items,
    }));
  }

  async findBannerItems(routePath?: string): Promise<BannerItem[]> {
    if (routePath) {
      return this.db
        .select()
        .from(bannerItems)
        .where(and(
          eq(bannerItems.isActive, true),
          eq(bannerItems.routePath, routePath)
        ));
    }

    return this.db
      .select()
      .from(bannerItems)
      .where(eq(bannerItems.isActive, true));
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
    const results = await this.db
      .select()
      .from(banners)
      .innerJoin(bannerItems, eq(banners.bannerItemId, bannerItems.id))
      .where(eq(banners.id, id));

    const banner = results[0];

    if (!banner || banner.banners.userId !== userId) {
      throw new BadRequestException('Banner not found or unauthorized');
    }

    // 이미지 삭제
    await this.awsService.deleteImage(banner.banners.imageUrl);

    // 배너가 시작되지 않았다면 환불
    if (banner.banners.startAt > new Date() && banner.banners.isApproved) {
      await this.db.transaction(async (tx) => {
        await tx
          .update(predicts)
          .set({
            vault: sql`${predicts.vault} + ${banner.banners.amount}`,
          })
          .where(eq(predicts.userId, userId));

        await tx.delete(banners).where(eq(banners.id, id));
      });
    } else {
      await this.db.delete(banners).where(eq(banners.id, id));
    }
  }

  async deactivateBannerItem(id: number): Promise<BannerItem> {
    const [bannerItem] = await this.db
      .update(bannerItems)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(bannerItems.id, id))
      .returning();

    return bannerItem;
  }

  async findAll(): Promise<BannerWithItem[]> {
    const results = await this.db
      .select()
      .from(banners)
      .innerJoin(bannerItems, eq(banners.bannerItemId, bannerItems.id))
      .orderBy(desc(banners.createdAt));

    return results.map((row) => ({
      ...row.banners,
      bannerItem: row.banner_items,
    }));
  }

  async getActiveBanners(
    routePath: string,
    now: Date = new Date(),
  ): Promise<BannerWithItem[]> {
    const results = await this.db
      .select()
      .from(banners)
      .innerJoin(bannerItems, eq(banners.bannerItemId, bannerItems.id))
      .where(
        and(
          eq(bannerItems.routePath, routePath),
          eq(banners.isApproved, true),
          eq(bannerItems.isActive, true),
          gte(banners.endAt, now),
          sql`${banners.startAt} <= NOW()`,
        ),
      )
      .orderBy(bannerItems.position);

    return results.map((row) => ({
      ...row.banners,
      bannerItem: row.banner_items,
    }));
  }

  async updateImage(id: number, userId: number, image: Express.Multer.File): Promise<Banner> {
    // 배너 조회 및 권한 확인
    const [banner] = await this.db
      .select()
      .from(banners)
      .where(eq(banners.id, id));

    if (!banner || banner.userId !== userId) {
      throw new BadRequestException('Banner not found or unauthorized');
    }

    // 기존 이미지 삭제
    await this.awsService.deleteImage(banner.imageUrl);

    // 새 이미지 업로드
    const imageUrl = await this.awsService.uploadImage(image, 'banners');

    // 배너 업데이트
    const [updatedBanner] = await this.db
      .update(banners)
      .set({
        imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, id))
      .returning();

    return updatedBanner;
  }

  async update(id: number, userId: number, updateData: { forwardUrl?: string }): Promise<Banner> {
    // 배너 조회 및 권한 확인
    const [banner] = await this.db
      .select()
      .from(banners)
      .where(eq(banners.id, id));

    if (!banner || banner.userId !== userId) {
      throw new BadRequestException('Banner not found or unauthorized');
    }

    // 배너 업데이트
    const [updatedBanner] = await this.db
      .update(banners)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, id))
      .returning();

    return updatedBanner;
  }
}
