export interface BannerItem {
  id: number;
  routePath: string;
  previewImageUrl: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  position: 'top' | 'middle' | 'bottom';
  recommendedImageSize: string;
  pricePerDay: string;
  cocoaMoneyPerDay: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: number;
  userId: number;
  bannerItemId: number;
  imageUrl: string;
  forwardUrl: string;
  startAt: string;
  endAt: string;
  amount: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  bannerItem?: BannerItem;
} 