import { GuideCards } from "@/components/guide/GuideCards";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DeFi APY 이해하기 | CryptoScan",
  description:
    "디파이 수익률(APY)의 구성과 특징을 자세히 알아보세요. APY vs APR, 리스크 요소 분석.",
  openGraph: {
    title: "DeFi APY 이해하기 | CryptoScan",
    description:
      "디파이 수익률(APY)의 구성과 특징을 자세히 알아보세요. APY vs APR, 리스크 요소 분석.",
    images: ["/icons/og.png"],
  },
};

export default function DeFiAPYPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        디파이 APY 이해하기
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          APY(Annual Percentage Yield)는 복리를 고려한 연간 수익률을 의미합니다.
          디파이에서는 다양한 방식으로 APY가 발생하며, 이를 이해하는 것이
          중요합니다.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">APY vs APR</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">APY</h3>
            <p>복리 효과를 포함한 실질 수익률</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              예: 일일 복리 적용 시 더 높은 실질 수익
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">APR</h3>
            <p>단리로 계산된 연간 수익률</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              예: 복리 효과 미포함
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">APY 구성 요소</h2>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>기본 수익률 (Base APY)</strong>
            <p>프로토콜 참여로 얻는 기본적인 수익률</p>
          </li>
          <li>
            <strong>리워드 수익률 (Reward APY)</strong>
            <p>추가 토큰 보상으로 인한 수익률</p>
          </li>
          <li>
            <strong>거래 수수료 (Trading Fees)</strong>
            <p>DEX 유동성 풀 참여시 발생하는 수수료 수익</p>
          </li>
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200">
            주의사항
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-yellow-700 dark:text-yellow-300">
            <li>APY는 변동성이 크며, 과거 수익률이 미래를 보장하지 않습니다</li>
            <li>높은 APY에는 그만큼의 리스크가 동반됩니다</li>
            <li>토큰 가격 변동에 따른 손실 가능성을 고려해야 합니다</li>
          </ul>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          더 알아보기
        </h2>
        <GuideCards excludeHref="/guide/defi/apy" />
      </div>
    </div>
  );
}
