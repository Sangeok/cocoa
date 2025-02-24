"use client";

import { useEffect, useState } from "react";
import { globalMetricAPI } from "@/lib/api/globalMetric";
import { formatCurrency } from "@/lib/format";
import { GlobalMetricData } from "@/lib/api/globalMetric";

const MetricCard = ({
  title,
  value,
  change,
  subtitle,
  iconSrc,
}: {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  iconSrc?: string;
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
    {iconSrc && (
      <div className="flex items-center justify-center mb-4">
        <img src={iconSrc} alt={title} className="w-12 h-12 object-contain" />
      </div>
    )}
    <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">{title}</h3>
    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
      {value}
    </div>
    {change !== undefined && (
      <div
        className={`text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}
      >
        {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(2)}%
      </div>
    )}
    {subtitle && (
      <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
    )}
  </div>
);

export default function MetricPage() {
  const [metric, setMetric] = useState<GlobalMetricData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetric = async () => {
      try {
        const response = await globalMetricAPI.getGlobalMetrics();
        setMetric(response);
      } catch (error) {
        console.error("Failed to fetch metric:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetric();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!metric) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          데이터를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        글로벌 메트릭
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="총 시가총액"
          value={`${formatCurrency(metric.quote.USD.total_market_cap)}`}
          change={metric.quote.USD.total_market_cap_yesterday_percentage_change}
        />
        <MetricCard
          title="24시간 거래량"
          value={`${formatCurrency(metric.quote.USD.total_volume_24h)}`}
          change={metric.quote.USD.total_volume_24h_yesterday_percentage_change}
        />
        <MetricCard
          title="BTC 도미넌스"
          value={`${metric.btc_dominance.toFixed(2)}%`}
          change={metric.btc_dominance_24h_percentage_change}
          iconSrc="/images/metrics/btc.png"
        />
        <MetricCard
          title="ETH 도미넌스"
          value={`${metric.eth_dominance.toFixed(2)}%`}
          change={metric.eth_dominance_24h_percentage_change}
          iconSrc="/images/metrics/eth.png"
        />
        <MetricCard
          title="활성 암호화폐"
          value={`${metric.active_cryptocurrencies}`}
          subtitle={`총 ${metric.total_cryptocurrencies}개`}
        />
        <MetricCard
          title="활성 거래소"
          value={`${metric.active_exchanges}`}
          subtitle={`총 ${metric.total_exchanges}개`}
        />
        <MetricCard
          title="활성 거래쌍"
          value={`${metric.active_market_pairs}`}
        />
      </div>
    </div>
  );
}
