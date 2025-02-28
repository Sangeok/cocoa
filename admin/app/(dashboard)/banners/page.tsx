"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
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
  Check,
  X,
  MonitorSmartphone,
  Smartphone,
  Tablet,
  LucideIcon,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_ROUTE, Banner, BannerItem, payloadMaker } from "@/lib/api";
import { For } from "react-haiku";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetch";
const DeviceTypeIcon: Record<BannerItem["deviceType"], LucideIcon> = {
  desktop: MonitorSmartphone,
  tablet: Tablet,
  mobile: Smartphone,
} as const;

export default function BannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [editingBanner, setEditingBanner] = useState<Banner & { bannerItem: BannerItem } | null>(null);
  const [newForwardUrl, setNewForwardUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 배너 목록 조회
  const {
    data: banners,
    isLoading,
    refetch,
  } = useQuery<(Banner & { bannerItem: BannerItem })[]>({
    queryKey: ["banners", selectedDate],
    queryFn: async () => {
      try {
        const { url, config } = payloadMaker({
          method: "GET",
          url: API_ROUTE.BANNER.LIST.url,
        });
        const response = await fetchWithAuth(url, config);

        if (!response.ok) {
          throw new Error("배너 목록을 불러오는데 실패했습니다");
        }

        const json = await response.json();
        return json.data || []; // 데이터가 없을 경우 빈 배열 반환
      } catch (error) {
        console.error("배너 목록 조회 실패:", error);
        return []; // 에러 발생 시 빈 배열 반환
      }
    },
  });

  // 배너 승인 처리
  const handleApprove = async (id: number) => {
    try {
      const { url, config } = payloadMaker({
        method: "POST",
        url: API_ROUTE.BANNER.APPROVE.url.replace(":id", id.toString()),
      });
      const response = await fetchWithAuth(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "배너 승인에 실패했습니다");
      }

      // 승인 후 목록 갱신
      await refetch();
    } catch (error) {
      console.error("배너 승인 실패:", error);
      alert(
        error instanceof Error ? error.message : "배너 승인에 실패했습니다"
      );
    }
  };

  // 배너 이미지 수정
  const { mutate: updateImage } = useMutation({
    mutationFn: async ({ id, image }: { id: number; image: File }) => {
      const formData = new FormData();
      formData.append("image", image);

      const { url, config } = payloadMaker({
        method: "POST",
        url: API_ROUTE.BANNER.UPDATE_IMAGE.url.replace(":id", id.toString()),
      });

      const response = await fetchWithAuth(url, {
        ...config,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "이미지 수정에 실패했습니다");
      }
    },
    onSuccess: () => {
      refetch();
      setSelectedImage(null);
      setIsEditModalOpen(false);
    },
  });

  // 배너 링크 수정
  const { mutate: updateForwardUrl } = useMutation({
    mutationFn: async ({ id, forwardUrl }: { id: number; forwardUrl: string }) => {
      const { url, config } = payloadMaker({
        method: "PATCH",
        url: API_ROUTE.BANNER.UPDATE.url.replace(":id", id.toString()),
        body: { forwardUrl },
      });

      const response = await fetchWithAuth(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "링크 수정에 실패했습니다");
      }
    },
    onSuccess: () => {
      refetch();
      setNewForwardUrl("");
      setIsEditModalOpen(false);
    },
  });

  const handleEdit = (banner: Banner & { bannerItem: BannerItem }) => {
    setEditingBanner(banner);
    setNewForwardUrl(banner.forwardUrl);
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingBanner) return;

    try {
      if (selectedImage) {
        await updateImage({ id: editingBanner.id, image: selectedImage });
      }
      
      if (newForwardUrl !== editingBanner.forwardUrl) {
        await updateForwardUrl({ id: editingBanner.id, forwardUrl: newForwardUrl });
      }
    } catch (error) {
      console.error("배너 수정 실패:", error);
      alert(error instanceof Error ? error.message : "배너 수정에 실패했습니다");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">배너 관리</h1>
          <p className="text-muted-foreground">
            등록된 광고 배너를 날짜별로 확인하고 관리할 수 있습니다.
          </p>
        </div>
        <Link href="/banners/items">
          <Button>배너 위치 관리</Button>
        </Link>
      </div>

      <div className="flex gap-6">
        <div className="border rounded-lg">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ko}
            className="rounded-md"
          />
        </div>

        <div className="flex-1 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>디바이스</TableHead>
                <TableHead>위치</TableHead>
                <TableHead>페이지</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>종료일</TableHead>
                <TableHead>링크</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>승인 상태</TableHead>
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
                  each={banners}
                  render={(banner) => {
                    const DeviceIcon =
                      DeviceTypeIcon[banner.bannerItem.deviceType];
                    return (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DeviceIcon className="h-4 w-4" />
                            <span className="capitalize">
                              {banner.bannerItem.deviceType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {banner.bannerItem.position}
                        </TableCell>
                        <TableCell>{banner.bannerItem.routePath}</TableCell>
                        <TableCell>
                          {format(new Date(banner.startAt), "yyyy.MM.dd", {
                            locale: ko,
                          })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(banner.endAt), "yyyy.MM.dd", {
                            locale: ko,
                          })}
                        </TableCell>
                        <TableCell>
                          <a
                            href={banner.forwardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {banner.forwardUrl}
                          </a>
                        </TableCell>
                        <TableCell>
                          {parseInt(banner.amount).toLocaleString()}원
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                              banner.isApproved
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            )}
                          >
                            {banner.isApproved ? (
                              <Check className="mr-1 h-3 w-3" />
                            ) : (
                              <X className="mr-1 h-3 w-3" />
                            )}
                            {banner.isApproved ? "승인됨" : "대기중"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!banner.isApproved && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(banner.id)}
                              >
                                승인
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(banner)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배너 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>현재 이미지</Label>
              {editingBanner && (
                <img
                  src={editingBanner.imageUrl}
                  alt="Current banner"
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">새 이미지</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forwardUrl">링크</Label>
              <Input
                id="forwardUrl"
                value={newForwardUrl}
                onChange={(e) => setNewForwardUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSave}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
