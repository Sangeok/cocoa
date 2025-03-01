"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/const/api";
import { ClientAPICall } from "@/lib/axios";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { formatCurrency } from "@/lib/format";

export default function BannerPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: priceData } = useQuery({
    queryKey: ["bannerPrice"],
    queryFn: async () => {
      const response = await ClientAPICall.get(API_ROUTES.BANNER.PRICE.url);
      return response.data;
    },
  });

  const pricePerDay = priceData?.data || 5000; // 기본값 5000

  const handleCreateBanner = () => {
    if (!user) {
      alert("로그인 후 이용해주세요.");
      router.push("/signin");
      return;
    }
    router.push("/banner/create");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold">코코아 배너 광고</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          코코아에 배너를 등록하여 광고를 시작하세요. 코코아 머니로도 광고가
          가능합니다!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
            <i className="fas fa-bullseye text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">타겟 광고</h3>
          <p className="text-gray-600 dark:text-gray-400">
            원하는 페이지에 배너를 노출하여 효과적인 광고가 가능합니다.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
            <i className="fas fa-desktop text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">반응형 디자인</h3>
          <p className="text-gray-600 dark:text-gray-400">
            데스크톱, 태블릿, 모바일 등 모든 기기에서 최적화된 배너를
            보여줍니다.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
            <i className="fas fa-clock text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">유연한 기간 설정</h3>
          <p className="text-gray-600 dark:text-gray-400">
            원하는 기간만큼 광고를 집행할 수 있습니다.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
            <i className="fas fa-coins text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">코코아 머니로 결제</h3>
          <p className="text-gray-600 dark:text-gray-400">
            코코아 머니로도 광고할 수 있습니다.(물론 현금으로도 가능합니다!)
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mb-12">
        <h2 className="text-xl font-bold mb-4">결제 안내</h2>
        <p className="mb-4">
          배너 광고는 코코아 머니로 결제됩니다.
          <br />
          현재 보유하신 코코아 머니:{" "}
          <span className="font-bold">
            {formatCurrency(user?.predict.vault || 0)}
          </span>
        </p>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>* 광고 승인 후에는 환불이 불가능합니다.</p>
          <p>* 광고 내용에 따라 승인이 거절될 수 있습니다.</p>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleCreateBanner}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
        >
          배너 광고 등록하기
        </button>
      </div>
    </div>
  );
}
