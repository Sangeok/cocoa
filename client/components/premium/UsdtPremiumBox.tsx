import useMarketStore from "@/store/useMarketStore";
import { formatNumber } from "@/lib/format";
import Image from "next/image";
import { UPBIT_STATIC_IMAGE_URL } from "@/const";
export function UsdtPremiumBox() {
  const { coins, exchangeRate } = useMarketStore();
  const usdtUpbit = coins["USDT-KRW"]?.upbit?.price || 0;
  const usdtBithumb = coins["USDT-KRW"]?.bithumb?.price || 0;
  const rate = exchangeRate?.rate || 0;

  // 프리미엄 계산 (업비트 기준)
  const premium = rate > 0 ? (usdtUpbit / rate - 1) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-900">
      <div className="flex flex-wrap items-center gap-2 lg:gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src={`${UPBIT_STATIC_IMAGE_URL}/USDT.png`}
              alt="USDT"
              width={24}
              height={24}
            />
            <div>
              <div className="text-sm font-medium">테더</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                USDT
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Image
                src="/exchanges/upbit.svg"
                alt="Upbit"
                width={20}
                height={20}
              />
              업비트
            </div>
            <div className="text-sm font-medium text-right">
              ₩{formatNumber(usdtUpbit)}
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Image
                src="/exchanges/bithumb.svg"
                alt="Bithumb"
                width={15}
                height={20}
              />
              빗썸
            </div>
            <div className="text-sm font-medium text-right">
              ₩{formatNumber(usdtBithumb)}
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div className="text-sm text-gray-500 dark:text-gray-400">환율</div>
            <div className="text-sm font-medium">₩{formatNumber(Math.round(rate))}</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              프리미엄
            </div>
            <div
              className={`text-sm font-medium ${
                premium > 0
                  ? "text-green-500"
                  : premium < 0
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {premium.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
