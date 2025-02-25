import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { GlobalMetricData } from "@/lib/api/globalMetric";
import FearGreedIndex from "./FearGreedIndex";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
const GlobalMetric: React.FC<{ metric: GlobalMetricData }> = ({ metric }) => {
  if (!metric) {
    return <></>;
  }
  return (
    <div className="flex gap-4 mb-12 xl:w-1/2 w-full flex-col sm:flex-row">
      <div className="grid grid-cols-2 gap-2 lg:gap-4 w-full">
        <MetricCard
          title="총 시가총액"
          value={`${formatCurrency(metric.quote.USD.total_market_cap)}`}
          change={metric.quote.USD.total_market_cap_yesterday_percentage_change}
          href="https://coinmarketcap.com/charts/"
          target="_blank"
        />

        <MetricCard
          title="24시간 거래량"
          value={`${formatCurrency(metric.quote.USD.total_volume_24h)}`}
          change={metric.quote.USD.total_volume_24h_yesterday_percentage_change}
          href="https://coinmarketcap.com/charts/"
          target="_blank"
        />

        <MetricCard
          iconSrc="/images/metrics/btc.png"
          title="BTC 도미넌스"
          value={`${metric.btc_dominance.toFixed(2)}%`}
          change={metric.btc_dominance_24h_percentage_change}
          href="/coin/BTC-KRW"
        />

        <MetricCard
          iconSrc="/images/metrics/eth.png"
          title="ETH 도미넌스"
          value={`${metric.eth_dominance.toFixed(2)}%`}
          change={metric.eth_dominance_24h_percentage_change}
          href="/coin/ETH-KRW"
        />
      </div>
      <FearGreedIndex />
    </div>
  );
};

interface MetricCardProps {
  iconSrc?: string;
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  href: string;
  target?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  iconSrc,
  title,
  value,
  change,
  subtitle,
  href,
  target,
}) => {
  return (
    <Link
      href={href}
      target={target}
      className="bg-white dark:bg-gray-900 rounded-lg p-2 sm:p-3 lg:p-4 border border-gray-200 dark:border-gray-800
      transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <div className="flex items-center mb-1 sm:mb-2">
        {iconSrc && (
          <div className="w-4 h-4 mr-0.5 sm:mr-1 flex items-center justify-center">
            <img
              src={iconSrc}
              alt={title}
              className="w-4 h-4 object-contain"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
            {title}
          </h2>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
        {value}
      </div>
      {change !== undefined && (
        <div
          className={`text-xs sm:text-sm ${
            change >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(2)}%
        </div>
      )}
      {subtitle && (
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      )}
    </Link>
  );
};

export default GlobalMetric;
