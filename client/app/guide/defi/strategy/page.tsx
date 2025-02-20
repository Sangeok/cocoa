import { GuideCards } from "@/components/guide/GuideCards";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DeFi 투자 전략 | 코코아",
  description:
    "다양한 디파이 투자 전략과 리스크 관리 방법을 알아보세요. 안전하고 효율적인 투자를 위한 가이드.",
  openGraph: {
    title: "DeFi 투자 전략 | 코코아",
    description:
      "다양한 디파이 투자 전략과 리스크 관리 방법을 알아보세요. 안전하고 효율적인 투자를 위한 가이드.",
    images: ["/icons/og.png"],
  },
};

export default function DeFiStrategyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        디파이 투자 전략
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          디파이 투자에는 다양한 전략이 있으며, 각각의 장단점과 리스크를
          이해하는 것이 중요합니다.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">주요 투자 전략</h2>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">1. 단순 예치 전략</h3>
            <p>안정적인 토큰을 스테이킹하여 이자 수익 추구</p>
            <div className="mt-3">
              <span className="text-green-600 dark:text-green-400">장점:</span>
              <ul className="list-disc pl-6 mt-2">
                <li>낮은 리스크</li>
                <li>운영이 간단</li>
                <li>안정적인 수익</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">2. 유동성 공급 전략</h3>
            <p>DEX에 유동성을 공급하여 거래 수수료 획득</p>
            <div className="mt-3">
              <span className="text-green-600 dark:text-green-400">장점:</span>
              <ul className="list-disc pl-6 mt-2">
                <li>높은 수익 잠재력</li>
                <li>추가 토큰 보상</li>
              </ul>
              <span className="text-red-600 dark:text-red-400 mt-3 block">
                주의사항:
              </span>
              <ul className="list-disc pl-6 mt-2">
                <li>비영구적 손실 위험</li>
                <li>높은 변동성</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">3. 차익 거래 전략</h3>
            <p>여러 프로토콜 간의 수익률 차이를 활용</p>
            <div className="mt-3">
              <span className="text-green-600 dark:text-green-400">장점:</span>
              <ul className="list-disc pl-6 mt-2">
                <li>시장 중립적 수익</li>
                <li>높은 수익 기회</li>
              </ul>
              <span className="text-red-600 dark:text-red-400 mt-3 block">
                주의사항:
              </span>
              <ul className="list-disc pl-6 mt-2">
                <li>복잡한 운영</li>
                <li>가스비 고려 필요</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-3 text-blue-800 dark:text-blue-200">
            투자 시 고려사항
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-blue-700 dark:text-blue-300">
            <li>투자 금액은 감당할 수 있는 범위 내에서 설정</li>
            <li>프로토콜의 보안성과 감사 여부 확인</li>
            <li>분산 투자로 리스크 관리</li>
            <li>정기적인 재투자 전략 수립</li>
          </ul>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          더 알아보기
        </h2>
        <GuideCards excludeHref="/guide/defi/strategy" />
      </div>
    </div>
  );
}
