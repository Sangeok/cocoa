import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BannerService } from './banner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAdminAuthGuard } from '../admin/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface CreateBannerRequest {
  position: number;
  pages: string[];
  startAt: string;
  endAt: string;
}

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'desktopImage', maxCount: 1 },
      { name: 'tabletImage', maxCount: 1 },
      { name: 'mobileImage', maxCount: 1 },
    ]),
  )
  async create(
    @CurrentUser() userId: number,
    @Body() createBannerRequest: CreateBannerRequest,
    @UploadedFiles()
    files: {
      desktopImage?: Express.Multer.File[];
      tabletImage?: Express.Multer.File[];
      mobileImage?: Express.Multer.File[];
    },
  ) {
    if (!files.desktopImage?.[0] || !files.tabletImage?.[0] || !files.mobileImage?.[0]) {
      throw new BadRequestException('All images are required');
    }

    const banner = await this.bannerService.create({
      userId,
      position: createBannerRequest.position,
      pages: createBannerRequest.pages,
      desktopImage: files.desktopImage[0],
      tabletImage: files.tabletImage[0],
      mobileImage: files.mobileImage[0],
      startAt: new Date(createBannerRequest.startAt),
      endAt: new Date(createBannerRequest.endAt),
    });

    return {
      success: true,
      data: banner,
    };
  }

  @Get('active')
  async getActiveBanners(@Query('page') page: string = '/') {
    const banners = await this.bannerService.findActive(page);
    return {
      success: true,
      data: banners,
    };
  }

  @Get(':id')
  async getBanner(@Param('id') id: string) {
    const banner = await this.bannerService.findById(parseInt(id));
    return {
      success: true,
      data: banner,
    };
  }

  @Post(':id/approve')
  @UseGuards(JwtAdminAuthGuard)
  async approveBanner(@Param('id') id: string) {
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
  ) {
    await this.bannerService.delete(userId, parseInt(id));
    return {
      success: true,
      message: 'Banner deleted successfully',
    };
  }
}
