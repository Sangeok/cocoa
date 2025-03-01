import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/const/api";
import { ClientAPICall } from "@/lib/axios";
import DesktopBanner from "./Desktop";
import TabletBanner from "./Tablet";
import MobileBanner from "./Mobile";
import { sendGAEvent } from "@/lib/gtag";

interface BannerProps {
  position: "top" | "middle" | "bottom";
}

interface Banner {
  id: number;
  imageUrl: string;
  forwardUrl: string;
  bannerItem: {
    deviceType: "desktop" | "tablet" | "mobile";
    position: "top" | "middle" | "bottom";
  };
}

export default function Banner({ position }: BannerProps) {
  const pathname = usePathname();

  // 현재 페이지의 활성화된 배너 목록 조회
  const { data: banners } = useQuery<{ data: Banner[] }>({
    queryKey: ["banners", pathname, position],
    queryFn: async () => {
      // 경로 정규화
      let routePath = pathname || "/";

      // 경로 끝에 슬래시가 있으면 제거 (메인 페이지 제외)
      if (routePath !== "/" && routePath.endsWith("/")) {
        routePath = routePath.slice(0, -1);
      }

      // 경로가 비어있으면 "/"로 설정
      if (!routePath) {
        routePath = "/";
      }

      console.log("Fetching banners for path:", routePath); // 디버깅용 로그

      const response = await ClientAPICall.get(API_ROUTES.BANNER.LIST.url, {
        params: {
          routePath,
        },
      });

      console.log("Banner response:", response.data); // 디버깅용 로그
      return response.data;
    },
  });

  // 현재 위치(position)에 해당하는 배너들을 디바이스 타입별로 필터링
  const activeBanners =
    banners?.data?.filter(
      (banner) => banner.bannerItem.position === position
    ) || [];

  // 각 디바이스 타입별 배너 찾기
  const desktopBanner = activeBanners.find(
    (banner) => banner.bannerItem.deviceType === "desktop"
  );
  const tabletBanner = activeBanners.find(
    (banner) => banner.bannerItem.deviceType === "tablet"
  );
  const mobileBanner = activeBanners.find(
    (banner) => banner.bannerItem.deviceType === "mobile"
  );

  // 배너 클릭 핸들러
  const handleBannerClick = (forwardUrl: string, bannerId: number) => {
    // GA 이벤트 전송
    sendGAEvent("banner_click", {
      banner_id: bannerId,
      banner_url: forwardUrl,
    });
    window.open(forwardUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <DesktopBanner
        imageUrl={desktopBanner?.imageUrl}
        onClick={() =>
          desktopBanner?.forwardUrl &&
          handleBannerClick(desktopBanner.forwardUrl, desktopBanner.id)
        }
      />
      <TabletBanner
        imageUrl={tabletBanner?.imageUrl}
        onClick={() =>
          tabletBanner?.forwardUrl &&
          handleBannerClick(tabletBanner.forwardUrl, tabletBanner.id)
        }
      />
      <MobileBanner
        imageUrl={mobileBanner?.imageUrl}
        onClick={() =>
          mobileBanner?.forwardUrl &&
          handleBannerClick(mobileBanner.forwardUrl, mobileBanner.id)
        }
      />
    </>
  );
}
