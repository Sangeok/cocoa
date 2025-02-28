"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/const/api";
import { ClientAPICall } from "@/lib/axios";
import { useState, useEffect } from "react";
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
import Image from "next/image";
import { useRouter } from "next/navigation";

interface BannerItem {
  id: number;
  routePath: string;
  previewImageUrl: string;
  deviceType: "desktop" | "tablet" | "mobile";
  position: "top" | "middle" | "bottom";
  recommendedImageSize: string;
  pricePerDay: string;
  cocoaMoneyPerDay: string;
  isActive: boolean;
}

interface Banner {
  id: number;
  bannerItemId: number;
  startAt: string;
  endAt: string;
}

export default function CreateBannerPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedDates, setSelectedDates] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [selectedBannerItem, setSelectedBannerItem] =
    useState<BannerItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [forwardUrl, setForwardUrl] = useState("");
  const [paymentType, setPaymentType] = useState<"cash" | "cocoaMoney">("cash");

  const { data: bannerItems } = useQuery<ApiResponse<BannerItem[]>>({
    queryKey: ["bannerItems"],
    queryFn: async () => {
      const response = await ClientAPICall.get(
        API_ROUTES.BANNER.ITEMS.LIST.url
      );
      return response.data;
    },
  });

  const { data: activeBanners } = useQuery<ApiResponse<Banner[]>>({
    queryKey: ["activeBanners", selectedBannerItem?.id],
    queryFn: async () => {
      if (!selectedBannerItem) return { success: true, data: [] };
      const response = await ClientAPICall.get(API_ROUTES.BANNER.LIST.url);
      return response.data;
    },
    enabled: !!selectedBannerItem,
  });

  // 비로그인 상태 체크
  useEffect(() => {
    if (!user) {
      alert("로그인 후 이용해주세요.");
      router.push("/signin");
    }
  }, [user, router]);

  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  const calculateTotalCost = () => {
    if (!selectedDates[0] || !selectedDates[1] || !selectedBannerItem) return 0;

    const startDate = startOfDay(selectedDates[0]);
    const endDate = startOfDay(selectedDates[1]);
    const days = differenceInDays(endDate, startDate) + 1;

    const dailyRate =
      paymentType === "cash"
        ? parseFloat(selectedBannerItem.pricePerDay)
        : parseFloat(selectedBannerItem.cocoaMoneyPerDay);

    return days * dailyRate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDates[0] || !selectedDates[1]) {
      alert("광고 기간을 선택해주세요.");
      return;
    }

    if (!selectedBannerItem) {
      alert("배너 위치를 선택해주세요.");
      return;
    }

    if (!file) {
      alert("배너 이미지를 업로드해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("bannerItemId", selectedBannerItem.id.toString());
    formData.append("startAt", selectedDates[0].toISOString());
    formData.append("endAt", selectedDates[1].toISOString());
    formData.append("image", file);
    formData.append("forwardUrl", forwardUrl);
    formData.append("paymentType", paymentType);

    try {
      const response = await ClientAPICall.post(API_ROUTES.BANNER.CREATE.url, formData);
      if (response.data.success) {
        alert("배너가 등록되었습니다. 관리자 승인 후 게시됩니다.");
        router.push("/"); // 메인 페이지로 이동
      } else {
        alert(response.data.message || "배너 등록에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Error creating banner:", error.response?.data || error);
      alert(error.response?.data?.message || "배너 등록에 실패했습니다.");
    }
  };

  const totalCost = calculateTotalCost();
  const userBalance = user?.predict?.vault || 0;
  const isBalanceInsufficient =
    paymentType === "cocoaMoney" && totalCost > userBalance;

  // 최소 선택 가능 날짜를 이틀 후로 설정
  const minSelectableDate = startOfDay(addDays(new Date(), 2));

  // 기존 배너 일정을 캘린더에 표시하기 위한 타일 컨텐츠 설정
  const tileContent = ({ date }: { date: Date }) => {
    if (!selectedBannerItem || !activeBanners?.data) return null;

    const normalizedDate = startOfDay(date);
    const isReserved = activeBanners.data.some((banner) => {
      if (banner.bannerItemId !== selectedBannerItem.id) return false;
      const startDate = startOfDay(new Date(banner.startAt));
      const endDate = startOfDay(new Date(banner.endAt));
      return normalizedDate >= startDate && normalizedDate <= endDate;
    });

    return isReserved ? (
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
        <div>
          <h2 className="text-lg font-semibold mb-4">배너 위치 선택</h2>
          <div className="flex flex-col gap-4">
            <Select
              label="배너 위치"
              options={
                bannerItems?.data?.map((item) => ({
                  value: item.id.toString(),
                  label: `${item.routePath} - ${item.position} (${item.deviceType})`,
                })) || []
              }
              value={selectedBannerItem?.id.toString() || ""}
              onChange={(value) => {
                const item = bannerItems?.data?.find(
                  (i) => i.id.toString() === value
                );
                setSelectedBannerItem(item || null);
              }}
              required
            />
            {selectedBannerItem && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm mb-2">
                  권장 이미지 크기: {selectedBannerItem.recommendedImageSize}
                </p>
                <div className="relative h-[400px] w-full">
                  <Image
                    src={selectedBannerItem.previewImageUrl}
                    alt="배너 미리보기"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">광고 기간 선택</h2>
            <Calendar
              selectRange={true}
              value={selectedDates}
              onChange={setSelectedDates as any}
              minDate={minSelectableDate}
              tileContent={tileContent}
              tileDisabled={tileDisabled}
              className="w-full border rounded-lg p-4 bg-white dark:bg-gray-800"
              locale="ko-KR"
              calendarType="gregory"
            />
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-lg font-medium mb-4">결제 정보</h3>
            <Select
              label="결제 방식"
              options={[
                { value: "cash", label: "현금 결제" },
                { value: "cocoaMoney", label: "코코아 머니 결제" },
              ]}
              value={paymentType}
              onChange={(value) =>
                setPaymentType(value as "cash" | "cocoaMoney")
              }
              required
            />
            {selectedBannerItem && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>
                    일일 {paymentType === "cash" ? "현금" : "코코아 머니"} 가격:
                  </span>
                  <span>
                    {paymentType === "cash"
                      ? `${parseFloat(
                          selectedBannerItem.pricePerDay
                        ).toLocaleString()}원`
                      : formatDollar(
                          parseFloat(selectedBannerItem.cocoaMoneyPerDay)
                        )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>선택한 기간:</span>
                  <span>
                    {selectedDates[0] && selectedDates[1]
                      ? `${
                          differenceInDays(selectedDates[1], selectedDates[0]) +
                          1
                        }일`
                      : "-"}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>총 비용:</span>
                    <span className="text-lg text-blue-500">
                      {paymentType === "cash"
                        ? `${totalCost.toLocaleString()}원`
                        : formatDollar(totalCost)}
                    </span>
                  </div>
                </div>
                {paymentType === "cash" ? (
                  <div className="border-t pt-2 mt-2 space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      아래 계좌로 입금해주세요:
                    </p>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                      <p className="font-medium">3333-1947-39795</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        카카오뱅크 한상훈
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      * 입금자명은 반드시 회원 이메일 아이디와 동일해야 합니다.
                    </p>
                  </div>
                ) : (
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
                )}
              </div>
            )}
          </div>
        </div>

        {selectedBannerItem && (
          <div>
            <h2 className="text-lg font-semibold mb-2">배너 이미지 업로드</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              권장 이미지 크기: {selectedBannerItem.recommendedImageSize}
            </p>
            <FileInput
              label={`${selectedBannerItem.deviceType} 배너`}
              onChange={handleFileChange}
              required
              description={`권장 크기: ${selectedBannerItem.recommendedImageSize}`}
            />
          </div>
        )}

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
