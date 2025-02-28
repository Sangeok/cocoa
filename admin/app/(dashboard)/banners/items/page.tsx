"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MonitorSmartphone,
  Smartphone,
  Tablet,
  LucideIcon,
} from "lucide-react";
import { API_ROUTE, BannerItem, payloadMaker } from "@/lib/api";
import { For } from "react-haiku";
import Link from "next/link";

const DeviceTypeIcon: Record<BannerItem["deviceType"], LucideIcon> = {
  desktop: MonitorSmartphone,
  tablet: Tablet,
  mobile: Smartphone,
} as const;

export default function BannerItemsPage() {
  // 배너 아이템 목록 조회
  const { data: bannerItems, isLoading } = useQuery<BannerItem[]>({
    queryKey: ["bannerItems"],
    queryFn: async () => {
      const { url, config } = payloadMaker({
        method: "GET",
        url: API_ROUTE.BANNER.ITEMS.LIST.url,
      });
      const response = await fetch(url, config);
      const json = await response.json();
      return json.data;
    },
  });

  // 배너 아이템 비활성화 처리
  const handleDeactivate = async (id: number) => {
    const { url, config } = payloadMaker({
      method: "POST",
      url: API_ROUTE.BANNER.ITEMS.DEACTIVATE.url.replace(":id", id.toString()),
    });
    await fetch(url, config);
    // TODO: Invalidate query to refresh data
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">배너 위치 관리</h1>
          <p className="text-muted-foreground">
            광고 배너의 위치와 가격을 관리할 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/banners/items/create">
            <Button>배너 위치 생성</Button>
          </Link>
          <Link href="/banners">
            <Button variant="outline">배너 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>디바이스</TableHead>
              <TableHead>위치</TableHead>
              <TableHead>페이지</TableHead>
              <TableHead>권장 이미지 크기</TableHead>
              <TableHead>일일 현금 가격</TableHead>
              <TableHead>일일 코코아 머니</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <For
                each={Array.from({ length: 5 })}
                render={(_, i) => (
                  <TableRow key={i}>
                    <For
                      each={Array.from({ length: 8 })}
                      render={(_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                      )}
                    />
                  </TableRow>
                )}
              />
            ) : (
              <For
                each={bannerItems}
                render={(item) => {
                  const DeviceIcon = DeviceTypeIcon[item.deviceType];
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DeviceIcon className="h-4 w-4" />
                          <span className="capitalize">{item.deviceType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {item.position}
                      </TableCell>
                      <TableCell>{item.routePath}</TableCell>
                      <TableCell>{item.recommendedImageSize}</TableCell>
                      <TableCell>
                        {parseInt(item.pricePerDay).toLocaleString()}원
                      </TableCell>
                      <TableCell>
                        {parseInt(item.cocoaMoneyPerDay).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            item.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.isActive ? "활성" : "비활성"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.isActive && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeactivate(item.id)}
                          >
                            비활성화
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
