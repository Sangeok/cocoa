import { GuideCards } from "@/components/guide/GuideCards";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "디파이(DeFi)란? | 코코아",
  description:
    "디파이의 기본 개념과 주요 특징을 알아보세요. 탈중앙화 금융의 모든 것을 설명합니다.",
  openGraph: {
    title: "디파이(DeFi)란? | 코코아",
    description:
      "디파이의 기본 개념과 주요 특징을 알아보세요. 탈중앙화 금융의 모든 것을 설명합니다.",
    images: ["/icons/og.png"],
  },
};

export default function DeFiAboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        디파이(DeFi)란?
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          디파이(DeFi)는 Decentralized Finance의 약자로, 분산화된 금융을
          의미합니다. 기존 금융 시스템과 달리 중앙화된 중개자 없이 블록체인
          기술을 통해 금융 서비스를 제공합니다.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">주요 특징</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>탈중앙화: 중앙 기관의 통제 없이 운영</li>
          <li>투명성: 모든 거래가 블록체인에 기록되어 공개</li>
          <li>접근성: 인터넷만 있다면 누구나 이용 가능</li>
          <li>자동화: 스마트 컨트랙트를 통한 자동 실행</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">주요 서비스</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">대출/차입</h3>
            <p>
              담보를 제공하고 암호화폐를 대출받거나, 보유한 암호화폐로 이자 수익
              창출
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">DEX</h3>
            <p>중앙화 거래소 없이 토큰 간 직접 교환 가능</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">유동성 풀</h3>
            <p>토큰 쌍에 유동성을 제공하고 수수료 수익 획득</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">스테이킹</h3>
            <p>토큰을 예치하고 네트워크 검증에 참여하여 보상 획득</p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          더 알아보기
        </h2>
        <GuideCards excludeHref="/guide/defi/about" />
      </div>
    </div>
  );
}
