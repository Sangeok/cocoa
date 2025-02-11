export const EXCHANGE_OPTIONS = [
  { value: "upbit", label: "업비트", image: true },
  { value: "bithumb", label: "빗썸", image: true },
  { value: "binance", label: "바이낸스", image: true },
  { value: "coinone", label: "코인원", image: true },
] as const;

export const BASE_TOKEN_OPTIONS = {
  upbit: [
    { value: "KRW", label: "KRW", image: true },
    { value: "BTC", label: "BTC", image: true },
    { value: "USDT", label: "USDT", image: true },
  ],
  bithumb: [
    { value: "KRW", label: "KRW", image: true },
    { value: "BTC", label: "BTC", image: true },
  ],
  binance: [{ value: "USDT", label: "USDT", image: true }],
  coinone: [{ value: "KRW", label: "KRW", image: true }],
} as const;


// 타입 추출을 위한 헬퍼 타입
type ExtractValue<T> = T extends { value: infer V } ? V : never;
export type ExchangeValue = ExtractValue<(typeof EXCHANGE_OPTIONS)[number]>;
export type QuoteTokenValue = ExtractValue<
  (typeof BASE_TOKEN_OPTIONS)["upbit"][number]
>;

export const KOREA_EXCHANGES = EXCHANGE_OPTIONS.slice(0, 2);
export const GLOBAL_EXCHANGES = [
  { value: "okx", label: "OKX" },
  { value: "coinbase", label: "코인베이스" },
  { value: "bybit", label: "바이비트" },
] as const;
