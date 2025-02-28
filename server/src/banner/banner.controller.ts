import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannerService } from './banner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAdminAuthGuard } from '../admin/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Banner, BannerItem } from '../database/schema/banner';

interface CreateBannerRequest {
  bannerItemId: number;
  forwardUrl: string;
  startAt: string;
  endAt: string;
  paymentType: 'cash' | 'cocoaMoney';
}

interface CreateBannerItemRequest {
  routePath: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  position: 'top' | 'middle' | 'bottom';
  recommendedImageSize: string;
  pricePerDay: number;
  cocoaMoneyPerDay: number;
}

interface UpdateBannerRequest {
  forwardUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @CurrentUser() userId: number,
    @Body() createBannerRequest: CreateBannerRequest,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ApiResponse<Banner>> {
    if (!image) {
      throw new BadRequestException('Image is required');
    }

    const banner = await this.bannerService.create({
      userId,
      bannerItemId: Number(createBannerRequest.bannerItemId),
      image,
      forwardUrl: createBannerRequest.forwardUrl,
      startAt: new Date(createBannerRequest.startAt),
      endAt: new Date(createBannerRequest.endAt),
      paymentType: createBannerRequest.paymentType,
    });

    return {
      success: true,
      data: banner,
    };
  }

  @Post('items')
  @UseGuards(JwtAdminAuthGuard)
  @UseInterceptors(FileInterceptor('previewImage'))
  async createBannerItem(
    @Body() createBannerItemRequest: CreateBannerItemRequest,
    @UploadedFile() previewImage: Express.Multer.File,
  ): Promise<ApiResponse<BannerItem>> {
    if (!previewImage) {
      throw new BadRequestException('Preview image is required');
    }

    const bannerItem = await this.bannerService.createBannerItem({
      ...createBannerItemRequest,
      previewImage,
    });

    return {
      success: true,
      data: bannerItem,
    };
  }

  @Get('items')
  async getBannerItems(
    @Query('routePath') routePath?: string,
  ): Promise<ApiResponse<BannerItem[]>> {
    const bannerItems = await this.bannerService.findBannerItems(routePath);
    return {
      success: true,
      data: bannerItems,
    };
  }

  @Get()
  @UseGuards(JwtAdminAuthGuard)
  async getBanners(): Promise<ApiResponse<Banner[]>> {
    const banners = await this.bannerService.findAll();
    return {
      success: true,
      data: banners,
    };
  }

  @Get('active')
  async getActiveBanners(
    @Query('routePath') routePath: string = '/',
  ): Promise<ApiResponse<Banner[]>> {
    const banners = await this.bannerService.findActive(routePath);
    return {
      success: true,
      data: banners,
    };
  }

  @Get(':id')
  async getBanner(@Param('id') id: string): Promise<ApiResponse<Banner>> {
    const banner = await this.bannerService.findById(parseInt(id));
    return {
      success: true,
      data: banner,
    };
  }

  @Post(':id/approve')
  @UseGuards(JwtAdminAuthGuard)
  async approveBanner(@Param('id') id: string): Promise<ApiResponse<Banner>> {
    const banner = await this.bannerService.approve(parseInt(id));
    return {
      success: true,
      data: banner,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBanner(
    @CurrentUser() userId: number,
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    await this.bannerService.delete(userId, parseInt(id));
    return {
      success: true,
      message: 'Banner deleted successfully',
    };
  }

  @Post('items/:id/deactivate')
  @UseGuards(JwtAdminAuthGuard)
  async deactivateBannerItem(
    @Param('id') id: string,
  ): Promise<ApiResponse<BannerItem>> {
    const bannerItem = await this.bannerService.deactivateBannerItem(parseInt(id));
    return {
      success: true,
      data: bannerItem,
    };
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @CurrentUser() userId: number,
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ApiResponse<Banner>> {
    if (!image) {
      throw new BadRequestException('Image is required');
    }

    const banner = await this.bannerService.updateImage(parseInt(id), userId, image);
    return {
      success: true,
      data: banner,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateBanner(
    @CurrentUser() userId: number,
    @Param('id') id: string,
    @Body() updateBannerRequest: UpdateBannerRequest,
  ): Promise<ApiResponse<Banner>> {
    const banner = await this.bannerService.update(parseInt(id), userId, updateBannerRequest);
    return {
      success: true,
      data: banner,
    };
  }
}
