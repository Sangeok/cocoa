import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { GlobalMetricData } from "@/lib/api/globalMetric";

const GlobalMetric: React.FC<{ metric: GlobalMetricData }> = ({ metric }) => {
  if (!metric) {
    return <></>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
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

      {/* <MetricCard
        iconSrc="/images/metrics/coins.png"
        title="활성 암호화폐"
        value={formatNumber(metric.active_cryptocurrencies)}
        subtitle={`총 ${formatNumber(metric.total_cryptocurrencies)}개`}
      />

      <MetricCard
        iconSrc="/images/metrics/exchange.png"
        title="활성 거래소"
        value={formatNumber(metric.active_exchanges)}
        subtitle={`총 ${formatNumber(metric.active_exchanges)}개`}
      />

      <MetricCard
        iconSrc="/images/metrics/trading-pair.png"
        title="활성 거래쌍"
        value={formatNumber(metric.active_market_pairs)}
      /> */}
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
      className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800"
    >
      <div className="flex items-center mb-2">
        {iconSrc && (
          <div className="w-8 h-8 mr-2 flex items-center justify-center">
            <img src={iconSrc} alt={title} className="w-6 h-6 object-contain" />
          </div>
        )}
        <h3 className="text-gray-700 dark:text-gray-200 font-medium">
          {title}
        </h3>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      {change !== undefined && (
        <div
          className={`text-sm ${
            change >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(2)}%
        </div>
      )}
      {subtitle && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      )}
    </Link>
  );
};

export default GlobalMetric;
