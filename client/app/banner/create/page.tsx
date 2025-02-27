"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/const/api";
import { ClientAPICall } from "@/lib/axios";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ApiResponse } from "@/types/api";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import FileInput from "@/components/common/FileInput";
import useAuthStore from "@/store/useAuthStore";
import { addDays, differenceInDays, startOfDay } from "date-fns";
import { formatDollar } from "@/lib/format";

interface Banner {
  id: number;
  position: number;
  pages: string[];
  startAt: string;
  endAt: string;
}

export default function CreateBannerPage() {
  const { user } = useAuthStore();
  const [selectedDates, setSelectedDates] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [position, setPosition] = useState<number>(1);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [files, setFiles] = useState({
    desktop: null as File | null,
    tablet: null as File | null,
    mobile: null as File | null,
  });
  const [forwardUrl, setForwardUrl] = useState("");

  const { data: existingBanners } = useQuery<ApiResponse<Banner[]>>({
    queryKey: ["banners"],
    queryFn: async () => {
      const response = await ClientAPICall.get(API_ROUTES.BANNER.LIST.url);
      return response.data;
    },
  });

  const availablePositions = [
    { value: "1", label: "화면 최상단" },
    { value: "2", label: "화면 중단" },
    { value: "3", label: "화면 하단" },
  ];

  const availablePages = [
    { value: "main", label: "메인 페이지" },
    { value: "predict", label: "가격 예측" },
    { value: "coin", label: "코인별 페이지" },
    { value: "news", label: "코코아 뉴스 메인 페이지" },
    { value: "news-detail", label: "코코아 뉴스 상세 페이지" },
    { value: "withdraw", label: "송금 계산기 페이지" },
    { value: "kol", label: "국내 KOL 목록 페이지" },
    { value: "scanner", label: "컨트렉트 스캐너 페이지" },
    { value: "defi", label: "DeFi 수익률 페이지" },
    { value: "user", label: "방명록 페이지" },
  ];

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "tablet" | "mobile"
  ) => {
    if (e.target.files?.[0]) {
      setFiles((prev) => ({
        ...prev,
        [type]: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDates[0] || !selectedDates[1]) {
      alert("광고 기간을 선택해주세요.");
      return;
    }

    if (!files.desktop || !files.tablet || !files.mobile) {
      alert("모든 배너 이미지를 업로드해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("position", position.toString());
    formData.append("pages", JSON.stringify([selectedPage]));
    formData.append("startAt", selectedDates[0].toISOString());
    formData.append("endAt", selectedDates[1].toISOString());
    formData.append("desktopImage", files.desktop);
    formData.append("tabletImage", files.tablet);
    formData.append("mobileImage", files.mobile);
    formData.append("forwardUrl", forwardUrl);

    try {
      await ClientAPICall.post(API_ROUTES.BANNER.CREATE.url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("배너가 등록되었습니다. 관리자 승인 후 게시됩니다.");
    } catch (error) {
      alert("배너 등록에 실패했습니다.");
    }
  };

  // 최소 선택 가능 날짜를 이틀 후로 설정
  const minSelectableDate = startOfDay(addDays(new Date(), 2));

  // 일일 광고 비용 (예: $5000/day)
  const { data: priceData } = useQuery({
    queryKey: ["bannerPrice"],
    queryFn: async () => {
      const response = await ClientAPICall.get(API_ROUTES.BANNER.PRICE.url);
      return response.data;
    },
  });

  const DAILY_AD_RATE = priceData?.data || 5000;

  // 선택된 날짜 범위에 따른 총 비용 계산
  const calculateTotalCost = () => {
    if (!selectedDates[0] || !selectedDates[1]) return 0;

    // 시작일과 종료일의 시작 시점(자정)을 기준으로 계산
    const startDate = startOfDay(selectedDates[0]);
    const endDate = startOfDay(selectedDates[1]);

    // differenceInDays는 자정 기준으로 날짜 차이를 계산
    const days = differenceInDays(endDate, startDate) + 1;
    return days * DAILY_AD_RATE;
  };

  const totalCost = calculateTotalCost();
  const userBalance = user?.predict?.vault || 0;
  const isBalanceInsufficient = totalCost > userBalance;

  // 기존 배너 일정을 캘린더에 표시하기 위한 타일 컨텐츠 설정
  const tileContent = ({ date }: { date: Date }) => {
    const normalizedDate = startOfDay(date);
    const bannerForDate = existingBanners?.data?.find((banner) => {
      const start = startOfDay(new Date(banner.startAt));
      const end = startOfDay(new Date(banner.endAt));
      return normalizedDate >= start && normalizedDate <= end;
    });

    return bannerForDate ? (
      <div className="text-xs text-red-500">예약됨</div>
    ) : null;
  };

  // 날짜가 선택 가능한지 확인하는 함수
  const tileDisabled = ({ date }: { date: Date }) => {
    return startOfDay(date) < minSelectableDate;
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-8">배너 광고 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="">
          <h2 className="text-lg font-semibold mb-4">광고 기간 선택</h2>
          <div className="flex gap-4">
            <Calendar
              selectRange={true}
              value={selectedDates}
              onChange={setSelectedDates as any}
              minDate={minSelectableDate}
              tileContent={tileContent}
              tileDisabled={tileDisabled}
              className="w-full border rounded-lg p-4"
              locale="ko-KR"
              calendarType="gregory"
            />
            <div className="space-y-4">
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg min-w-[320px]">
                <h3 className="text-lg font-medium mb-4">예상 광고 비용</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>일일 광고 비용:</span>
                    <span>{formatDollar(DAILY_AD_RATE)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>선택한 기간:</span>
                    <span>
                      {selectedDates[0] && selectedDates[1]
                        ? `${
                            differenceInDays(
                              startOfDay(selectedDates[1]),
                              startOfDay(selectedDates[0])
                            ) + 1
                          }일`
                        : "-"}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>총 예상 비용:</span>
                      <span className="text-lg text-blue-500">
                        {formatDollar(totalCost)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-2 mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>보유 코코아 머니:</span>
                      <span>{formatDollar(userBalance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>배너 등록 후 잔액:</span>
                      <span
                        className={isBalanceInsufficient ? "text-red-500" : ""}
                      >
                        {formatDollar(userBalance - totalCost)}
                      </span>
                    </div>
                    {isBalanceInsufficient && (
                      <p className="text-red-500 text-sm">
                        코코아 머니가 부족합니다. 충전 후 다시 시도해주세요.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Select
          label="광고 위치 선택"
          options={availablePositions}
          value={position.toString()}
          onChange={(value) => setPosition(Number(value))}
          required
        />

        <Select
          label="노출 페이지 선택"
          options={availablePages}
          value={selectedPage}
          onChange={setSelectedPage}
          required
          placeholder="페이지를 선택해주세요"
        />

        <div>
          <h2 className="text-lg font-semibold mb-2">배너 이미지 업로드</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            사용자의 디바이스 환경에 최적화된 광고를 제공하기 위해 세 가지
            크기의 배너 이미지가 필요합니다. 각각의 이미지는 지정된 크기로
            제작되어야 하며, 텍스트가 선명하게 보이도록 해주세요.
          </p>
          <div className="space-y-4">
            <FileInput
              label="데스크톱 배너"
              onChange={(file) =>
                setFiles((prev) => ({ ...prev, desktop: file }))
              }
              required
              dimensions={{ width: 1200, height: 150 }}
              description="권장 크기: 1200x150px"
            />
            <FileInput
              label="태블릿 배너"
              onChange={(file) =>
                setFiles((prev) => ({ ...prev, tablet: file }))
              }
              required
              dimensions={{ width: 768, height: 100 }}
              description="권장 크기: 768x100px"
            />
            <FileInput
              label="모바일 배너"
              onChange={(file) =>
                setFiles((prev) => ({ ...prev, mobile: file }))
              }
              required
              dimensions={{ width: 360, height: 80 }}
              description="권장 크기: 360x80px"
            />
          </div>
        </div>

        <Input
          label="클릭 시 이동할 URL"
          type="url"
          value={forwardUrl}
          onChange={setForwardUrl}
          placeholder="https://"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isBalanceInsufficient}
        >
          배너 등록 신청하기
        </Button>
      </form>
    </div>
  );
}
