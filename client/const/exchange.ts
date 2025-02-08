export const EXCHANGE_OPTIONS = [
  { value: "upbit", label: "업비트" },
  { value: "bithumb", label: "빗썸" },
  { value: "binance", label: "바이낸스" },
] as const;

export const BASE_TOKEN_OPTIONS = {
  upbit: [
    { value: "KRW", label: "KRW" },
    { value: "BTC", label: "BTC" },
    { value: "USDT", label: "USDT" },
  ],
  bithumb: [
    { value: "KRW", label: "KRW" },
    { value: "BTC", label: "BTC" },
  ],
  binance: [{ value: "USDT", label: "USDT" }],
} as const;

// 타입 추출을 위한 헬퍼 타입
type ExtractValue<T> = T extends { value: infer V } ? V : never;
export type ExchangeValue = ExtractValue<typeof EXCHANGE_OPTIONS[number]>;
export type QuoteTokenValue = ExtractValue<typeof BASE_TOKEN_OPTIONS['upbit'][number]>;

export const KOREA_EXCHANGES = EXCHANGE_OPTIONS.slice(0, 2);
export const GLOBAL_EXCHANGES = [
  { value: "okx", label: "OKX" },
  { value: "coinbase", label: "코인베이스" },
  { value: "bybit", label: "바이비트" },
] as const;