"use client";

import Image from "next/image";
import { formatKRWWithUnit, formatPercent } from "@/lib/format";
import { CoinData } from "@/store/useMarketStore";
import { Exchange } from "@/types/exchange";

interface MarketDataProps {
  symbol: string;
  coins: Record<string, CoinData>;
}

const getExchangeMarketUrl = (exchange: Exchange, symbol: string) => {
  const [base, quote] = symbol.split("-");

  switch (exchange) {
    case "upbit":
      return `https://upbit.com/exchange?code=CRIX.UPBIT.${quote}-${base}`;
    case "bithumb":
      return `https://www.bithumb.com/trade/order/${base}_${quote}`;
    case "coinone":
      return `https://coinone.co.kr/exchange/${base.toLowerCase()}`;
    case "binance":
      return `https://www.binance.com/en/trade/${base}_${quote}`;
    case "okx":
      return `https://www.okx.com/trade-spot/${base.toLowerCase()}-${quote.toLowerCase()}`;
    default:
      return "";
  }
};

const ExchangeVolume = ({
  symbol,
  coins,
  exchange,
}: {
  symbol: string;
  coins: Record<string, CoinData>;
  exchange: Exchange;
}) => {
  if (!coins[symbol]?.[exchange]) return null;

  const marketUrl = getExchangeMarketUrl(exchange, symbol);

  return (
    <a
      href={marketUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 sm:p-2 rounded-lg transition-colors cursor-pointer"
    >
      <Image
        src={`/exchanges/${exchange}.svg`}
        alt={exchange}
        width={16}
        height={16}
        className="opacity-75"
      />
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {exchange}
        </div>
        <div className="text-sm font-semibold">
          {formatKRWWithUnit(coins[symbol]?.[exchange]?.volume || 0)}
        </div>
      </div>
    </a>
  );
};

const ExchangePrice = ({
  symbol,
  coins,
  exchange,
}: {
  symbol: string;
  coins: Record<string, CoinData>;
  exchange: Exchange;
}) => {
  if (!coins[symbol]?.[exchange]) return null;

  const marketUrl = getExchangeMarketUrl(exchange, symbol);

  return (
    <a
      href={marketUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 sm:p-2 rounded-lg transition-colors cursor-pointer"
    >
      <Image
        src={`/exchanges/${exchange}.svg`}
        alt={exchange}
        width={16}
        height={16}
        className="opacity-75"
      />
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {exchange}
        </div>
        <div className="text-sm font-semibold">
          {formatKRWWithUnit(coins[symbol]?.[exchange]?.price || 0)}
        </div>
      </div>
    </a>
  );
};

const ExchangeChange24h = ({
  symbol,
  coins,
  exchange,
}: {
  symbol: string;
  coins: Record<string, CoinData>;
  exchange: Exchange;
}) => {
  if (!coins[symbol]?.[exchange]) return null;

  const marketUrl = getExchangeMarketUrl(exchange, symbol);

  return (
    <a
      href={marketUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 sm:p-2 rounded-lg transition-colors cursor-pointer"
    >
      <Image
        src={`/exchanges/${exchange}.svg`}
        alt={exchange}
        width={16}
        height={16}
        className="opacity-75"
      />
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {exchange}
        </div>
        <div
          className={`text-sm font-semibold ${
            coins[symbol]?.[exchange]?.change24h >= 0
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {formatPercent(coins[symbol]?.[exchange]?.change24h || 0)}
        </div>
      </div>
    </a>
  );
};

const MarketSection = ({
  title,
  marketType,
  symbol,
  coins,
}: {
  title: string;
  marketType: "KRW" | "USDT" | "BTC";
  symbol: string;
  coins: Record<string, CoinData>;
}) => {
  const baseCoin = symbol.split("-")[0];
  const fullSymbol = `${baseCoin}-${marketType}`;

  // 해당 마켓 타입에 대한 데이터 존재 여부 확인
  const hasMarketData = (() => {
    if (marketType === "KRW") {
      return !!(
        coins[fullSymbol]?.upbit ||
        coins[fullSymbol]?.bithumb ||
        coins[fullSymbol]?.coinone
      );
    }
    if (marketType === "USDT") {
      return !!coins[fullSymbol]?.binance;
    }
    if (marketType === "BTC") {
      return !!coins[fullSymbol]?.upbit || !!coins[fullSymbol]?.binance;
    }
    return false;
  })();

  // 데이터가 없으면 null 반환
  if (!hasMarketData) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 rounded-lg">
      <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        {title}
      </div>
      <div className="space-y-4">
        {/* 거래량 */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            거래량
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {marketType === "KRW" && (
              <>
                <ExchangeVolume
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="upbit"
                />
                <ExchangeVolume
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="bithumb"
                />
                <ExchangeVolume
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="coinone"
                />
              </>
            )}
            {marketType === "USDT" && (
              <>
                <ExchangeVolume
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="upbit"
                />
                <ExchangeVolume
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="binance"
                />
                <ExchangeVolume
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="okx"
                />
              </>
            )}
          </div>
        </div>

        {/* 현재가 */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            현재가
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {marketType === "KRW" && (
              <>
                <ExchangePrice
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="upbit"
                />
                <ExchangePrice
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="bithumb"
                />
                <ExchangePrice
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="coinone"
                />
              </>
            )}
            {marketType === "USDT" && (
              <>
                <ExchangePrice
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="upbit"
                />
                <ExchangePrice
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="binance"
                />
                <ExchangePrice
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="okx"
                />
              </>
            )}
          </div>
        </div>

        {/* 24시간 변동 */}
        <div>
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2">
            전일 대비 가격(%)
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {marketType === "KRW" && (
              <>
                <ExchangeChange24h
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="upbit"
                />
                <ExchangeChange24h
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="bithumb"
                />
                <ExchangeChange24h
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="coinone"
                />
              </>
            )}
            {marketType === "USDT" && (
              <>
                <ExchangeChange24h
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="upbit"
                />
                <ExchangeChange24h
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="binance"
                />
                <ExchangeChange24h
                  symbol={fullSymbol}
                  coins={coins}
                  exchange="okx"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MarketData({ symbol, coins }: MarketDataProps) {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          실시간 시장 데이터
        </h2>
      </div>

      <div className="p-1 sm:p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "원화 마켓 (KRW)", type: "KRW" as const },
            { title: "테더 마켓 (USDT)", type: "USDT" as const },
            { title: "비트코인 마켓 (BTC)", type: "BTC" as const },
          ].map((market) => (
            <MarketSection
              key={market.type}
              title={market.title}
              marketType={market.type}
              symbol={symbol}
              coins={coins}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
