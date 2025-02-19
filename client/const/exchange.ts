export const EXCHANGE_OPTIONS = [
  { value: "upbit", label: "업비트", image: true, url: "https://upbit.com" },
  { value: "bithumb", label: "빗썸", image: true, url: "https://bithumb.com" },
  { value: "binance", label: "바이낸스", image: true, url: "https://binance.com" },
  { value: "coinone", label: "코인원", image: true, url: "https://coinone.com" },
  { value: "okx", label: "OKX", image: true, url: "https://okx.com" },
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
  okx: [{ value: "USDT", label: "USDT", image: true }],
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
