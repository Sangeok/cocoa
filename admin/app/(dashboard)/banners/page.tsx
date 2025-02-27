"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Check, X } from "lucide-react";
import { API_ROUTE, Banner, payloadMaker } from "@/lib/api";
import { For } from "react-haiku";
import { cn } from "@/lib/utils";

export default function BannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // 배너 목록 조회
  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ["banners", selectedDate],
    queryFn: async () => {
      const { url, config } = payloadMaker({
        method: "GET",
        url: API_ROUTE.BANNER.LIST.url,
      });
      const response = await fetch(url, config);
      const json = await response.json();
      return json.data;
    },
  });

  // 배너 승인 처리
  const handleApprove = async (id: number) => {
    const { url, config } = payloadMaker({
      method: "POST",
      url: API_ROUTE.BANNER.APPROVE.url.replace(":id", id.toString()),
    });
    await fetch(url, config);
    // TODO: Invalidate query to refresh data
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">배너 관리</h1>
        <p className="text-muted-foreground">
          등록된 광고 배너를 날짜별로 확인하고 관리할 수 있습니다.
        </p>
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
                        each={Array.from({ length: 7 })}
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
                  render={(banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>{banner.position}</TableCell>
                      <TableCell>{banner.pages.join(", ")}</TableCell>
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
                        {!banner.isApproved && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(banner.id)}
                          >
                            승인
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
