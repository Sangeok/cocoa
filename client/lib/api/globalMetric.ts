import { ClientAPICall } from "../axios";
import { API_ROUTES } from "@/const/api";

export interface GlobalMetricData {
  active_cryptocurrencies: number;
  total_cryptocurrencies: number;
  active_market_pairs: number;
  active_exchanges: number;
  total_exchanges: number;
  eth_dominance: number;
  btc_dominance: number;
  eth_dominance_24h_percentage_change: number;
  btc_dominance_24h_percentage_change: number;
  quote: {
    USD: {
      total_market_cap: number;
      total_volume_24h: number;
      total_market_cap_yesterday_percentage_change: number;
      total_volume_24h_yesterday_percentage_change: number;
    };
  };
}

export const globalMetricAPI = {
  // 글로벌 메트릭 데이터 조회
  getGlobalMetrics: async () => {
    const response = await ClientAPICall.get<GlobalMetricData>(
      API_ROUTES.EXCHANGE.GLOBAL_METRICS.url
    );
    return response.data;
  },
};
