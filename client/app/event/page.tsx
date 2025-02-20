import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "제 1회 코코아 가격 예측 대회 | 코코아",
  description:
    "코코아에서 진행하는 가격 예측 대회! 치킨과 커피를 받아가세요.",
  openGraph: {
    title: "제 1회 코코아 가격 예측 대회",
    description:
      "코코아에서 진행하는 가격 예측 대회! 치킨과 커피를 받아가세요.",
    images: ["/images/event-banner.png"],
  },
};

export default function EventPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* 헤더 섹션 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            제 1회 코코아 가격 예측 대회
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            여러분의 예측 실력을 보여주세요!
          </p>
        </div>

        {/* 이벤트 기간 */}
        <div className="bg-white dark:bg-gray-950 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4">이벤트 기간</h2>
          <p className="text-gray-600 dark:text-gray-400">
            2024년 2월 15일 ~ 2024년 2월 28일
          </p>
        </div>

        {/* 상품 안내 */}
        <div className="bg-white dark:bg-gray-950 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4">🎁 상품 안내</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 text-center py-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg font-bold text-yellow-800 dark:text-yellow-200">
                1~3등
              </div>
              <div>
                <p className="font-semibold">치킨 기프티콘</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  배달의민족 치킨 기프티콘 (25,000원)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24 text-center py-2 bg-green-100 dark:bg-green-900 rounded-lg font-bold text-green-800 dark:text-green-200">
                4~50등
              </div>
              <div>
                <p className="font-semibold">스타벅스 아메리카노</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  스타벅스 아메리카노 기프티콘 (4,500원)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 획득 기준 섹션 추가 */}
        <div className="bg-white dark:bg-gray-950 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4">🏆 상품 획득 기준</h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              이벤트 기간 종료 시점의{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                총 자산 기준 상위 50명
              </span>
              에게 상품이 지급됩니다.
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">코코아 머니 획득 방법</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <span className="font-medium">가입 보너스:</span> 신규 가입 시{" "}
                  <span className="text-green-600 dark:text-green-400">
                    10,000 코코아 머니
                  </span>{" "}
                  지급
                </li>
                <li>
                  <span className="font-medium">출석 체크:</span> 매일{" "}
                  <span className="text-green-600 dark:text-green-400">
                    1,000 코코아 머니
                  </span>{" "}
                  지급
                </li>
                <li>
                  <span className="font-medium">예측 성공:</span> 예측 성공 시
                  투자금과 수익금 획득
                </li>
              </ul>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              💡 매일 출석 체크와 정확한 예측으로 자산을 늘려 상품의 주인공이
              되어보세요!
            </div>
          </div>
        </div>

        {/* 참여 방법 */}
        <div className="bg-white dark:bg-gray-950 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4">📝 참여 방법</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>코코아 회원가입</li>
            <li>가격 예측 페이지에서 예측 참여</li>
            <li>많은 승리로 자산을 늘려 랭킹에 도전!</li>
          </ol>
        </div>

        {/* 유의사항 */}
        <div className="bg-white dark:bg-gray-950 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4">⚠️ 유의사항</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>이벤트 기간 동안의 총 자산으로 순위가 결정됩니다.</li>
            <li>
              동일한 자산을 획득한 경우 더 많은 승리를 한 참가자가 우선됩니다.
            </li>
            <li>부정한 방법으로 참여 시 당첨이 취소될 수 있습니다.</li>
            <li>
              당첨자는 상품 수령을 위해 프로필 페이지에서 연락처를 등록해주셔야
              상품 지급이 가능합니다.
            </li>
            <li>당첨자는 이벤트 종료 후 개별 연락드립니다.</li>
            <li>기프티콘은 당첨자 발표 후 7일 이내 지급됩니다.</li>
            <li>
              가격은 실시간으로 적용되지만 실제 서버와 차이가 있을 수 있습니다.
            </li>
          </ul>
        </div>

        {/* 가격 예측 바로가기 버튼 */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center">
          <Link
            href="/coin/BTC-KRW"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 animate-bounce"
          >
            지금 바로 가격 예측 시작하기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
