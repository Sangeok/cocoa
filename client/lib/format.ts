import { CoinData } from "@/store/useMarketStore";
import { Exchange } from "@/types/exchange";

/**
 * 숫자를 한국 원화 형식으로 포맷팅합니다.
 * @param amount 포맷팅할 금액
 * @returns 포맷팅된 원화 문자열 (예: ₩1,234,567)
 */
export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

/**
 * 숫자를 한국 원화의 양식으로 조, 억, 만, 천원 단위로 변환합니다.
 * @param amount 포맷팅할 금액
 * @param showDecimals 소수점을 표시할지 여부
 * @returns 포맷팅된 원화 문자열 (예: ₩1,234,567)
 */
export function formatKRWWithUnit(amount: number, showDecimals: boolean = true): string {
  if (amount === null || amount === undefined) {
    return "0";
  }

  if (amount >= 1_000_000_000_000) {
    return `${showDecimals ? (amount / 1_000_000_000_000).toFixed(2) : Math.floor(amount / 1_000_000_000_000)}조`;
  }
  if (amount >= 100_000_000) {
    return `${showDecimals ? (amount / 100_000_000).toFixed(2) : Math.floor(amount / 100_000_000)}억`;
  }
  if (amount >= 10_000) {
    return `${showDecimals ? (amount / 10_000).toFixed(2) : Math.floor(amount / 10_000)}만`;
  }
  return `${showDecimals ? amount.toFixed(2) : Math.floor(amount)}`;
}

export function formatCryptoToKRWWithUnit(
  amount: number,
  price: number,
  exchangeRate: number,
  showDecimals: boolean = true
): string {
  return formatKRWWithUnit(amount * price * exchangeRate, showDecimals);
}

/**
 * 숫자를 암호화폐 수량 형식으로 포맷팅합니다.
 * @param amount 포맷팅할 수량
 * @returns 포맷팅된 수량 문자열 (예: 0.00123456)
 */
export function formatCrypto(amount: number): string {
  if (amount === null || amount === undefined) {
    return "0";
  }
  return amount.toFixed(8);
}

export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }

  return `$${value.toFixed(2)}`;
}

type QuoteToken = "KRW" | "USDT" | "BTC";

interface Market {
  exchange: Exchange;
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

export type ExchangePair = {
  from: Exchange;
  fromBase: string;
  to: Exchange;
  toBase: string;
};

/**
 * 마켓 가격을 지정된 기준 화폐로 변환
 */
export function convertPrice(
  price: number,
  fromQuote: QuoteToken,
  toQuote: QuoteToken,
  exchangeRates: {
    USDT: { KRW: number };
    BTC: { KRW: number; USDT: number };
  }
): number {
  if (fromQuote === toQuote) return price;

  // BTC로 변환
  if (fromQuote === "BTC") {
    if (toQuote === "KRW") return price * exchangeRates.BTC.KRW;
    if (toQuote === "USDT") return price * exchangeRates.BTC.USDT;
  }

  // USDT로 변환
  if (fromQuote === "USDT") {
    if (toQuote === "KRW") return price * exchangeRates.USDT.KRW;
    if (toQuote === "BTC") return price / exchangeRates.BTC.USDT;
  }

  // KRW로 변환
  if (fromQuote === "KRW") {
    if (toQuote === "USDT") return price / exchangeRates.USDT.KRW;
    if (toQuote === "BTC") return price / exchangeRates.BTC.KRW;
  }

  return price;
}

/**
 * 두 거래소 간의 가격 차이(프리미엄) 계산
 */
export const calculatePriceGap = (
  coins: Record<string, CoinData>,
  market: Market,
  exchangePair: ExchangePair,
  exchangeRates: {
    USDT: { KRW: number };
    BTC: { KRW: number; USDT: number };
  }
) => {
  try {
    let fromPriceInKRW = market.price;
    let toPriceInKRW = 0;

    // 출발 거래소 가격을 원화로 변환
    if (exchangePair.fromBase === "USDT") {
      fromPriceInKRW = market.price * exchangeRates.USDT.KRW;
    } else if (exchangePair.fromBase === "BTC") {
      // 해당 거래소의 실제 BTC-KRW 가격 사용
      const btcPrice = coins["BTC-KRW"]?.[exchangePair.from]?.price || 0;
      fromPriceInKRW = market.price * btcPrice;
    }

    // 도착 거래소 가격을 원화로 변환
    const [baseToken] = market.symbol.split("-");
    const toMarketSymbol = `${baseToken}-${exchangePair.toBase}`;
    const toPrice = coins[toMarketSymbol]?.[exchangePair.to]?.price || 0;

    if (exchangePair.toBase === "USDT") {
      toPriceInKRW = toPrice * exchangeRates.USDT.KRW;
    } else if (exchangePair.toBase === "BTC") {
      // 도착 거래소의 실제 BTC-KRW 가격 사용
      const btcPrice = coins["BTC-KRW"]?.[exchangePair.to]?.price || 0;
      toPriceInKRW = toPrice * btcPrice;
    } else {
      toPriceInKRW = toPrice;
    }

    // 프리미엄 계산 (양쪽 모두 0이 아닌 경우에만)
    if (fromPriceInKRW === 0 || toPriceInKRW === 0) return 0;
    return ((fromPriceInKRW - toPriceInKRW) / toPriceInKRW) * 100;
  } catch (error) {
    console.error("Error calculating price gap:", error);
    return 0;
  }
};

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(num);
}

export function formatDollar(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function getPnl(
  entryPrice: number,
  closePrice: number,
  leverage: number
) {
  return ((closePrice - entryPrice) / entryPrice) * 100 * leverage;
}

export function getDollarFromPnl(
  entryPrice: number,
  closePrice: number,
  leverage: number,
  deposit: number,
  position: "L" | "S"
): string {
  const pnl = getPnl(entryPrice, closePrice, leverage);

  return formatDollar((position === "S" ? -1 : 1) * (pnl / 100) * deposit);
}

export function getKRWFromPnl(
  entryPrice: number,
  closePrice: number,
  leverage: number,
  deposit: number,
  position: "L" | "S",
  exchangeRate: number
) {
  const pnl = getPnl(entryPrice, closePrice, leverage);

  return formatKRW(
    (position === "S" ? -1 : 1) * (pnl / 100) * deposit * exchangeRate
  );
}

/**
 * 가격을 포맷팅합니다.
 * @param price 포맷팅할 가격
 * @param decimals 소수점 자릿수 (기본값: 0)
 * @returns 포맷팅된 가격 문자열
 */
export function formatPrice(price: number, decimals: number = 0): string {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

/**
 * 퍼센트를 포맷팅합니다.
 * @param percent 포맷팅할 퍼센트 값
 * @param decimals 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 퍼센트 문자열 (예: "12.34%")
 */
export function formatPercent(percent: number, decimals: number = 2): string {
  return `${new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(percent)}%`;
}

/**
 * 숫자를 한글 단위로 변환합니다.
 */
function formatToKoreanUnit(price: number): string {
  if (price >= 1_000_000_000_000) {
    return `${(price / 1_000_000_000_000).toFixed(3)}조`;
  }
  if (price >= 100_000_000) {
    return `${(price / 100_000_000).toFixed(3)}억`;
  }
  if (price >= 10_000) {
    return `${(price / 10_000).toFixed(2)}만`;
  }
  return price.toFixed(0);
}

/**
 * 거래소 가격을 포맷팅합니다.
 */
export function formatExchangePrice(
  price: number,
  quoteToken: string,
  exchangeRate: { rate: number },
  isMobile: boolean = false
): string {
  let displayPrice = price;
  let suffix = "";

  if (quoteToken === "BTC") {
    suffix = " BTC";
  }

  // 가격 변환 로직
  if (quoteToken === "USDT") {
    displayPrice = price * (exchangeRate?.rate || 0);
  }

  // BTC 마켓이거나 모바일이 아닌 경우 기존 로직 사용
  if (quoteToken === "BTC" || !isMobile) {
    let fractionDigits = 0;
    if (quoteToken === "BTC") {
      fractionDigits = 8;
    } else if (displayPrice > 0 && displayPrice < 10) {
      if (displayPrice < 1) {
        const significantDigits = displayPrice.toFixed(8).match(/^0\.0*[1-9]/)?.[0].length || 1;
        fractionDigits = Math.max(significantDigits - 1, 0);
      } else {
        fractionDigits = 2;
      }
    }

    return new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(displayPrice) + suffix;
  }

  // 모바일에서는 한글 단위 사용
  return formatToKoreanUnit(displayPrice) + suffix;
}
