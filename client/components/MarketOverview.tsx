import { useAllCoinPrices, useExchangeRate } from '@/store/useMarketStore';
import { CoinPriceDisplay } from './CoinPriceDisplay';

export function MarketOverview() {
  const coinPrices = useAllCoinPrices();
  const exchangeRate = useExchangeRate();

  return (
    <div>
      <h1>Market Overview</h1>
      <div>
        <h2>Exchange Rate</h2>
        <p>
          1 USD = ₩
          {exchangeRate ? exchangeRate.rate.toLocaleString() : 'Loading...'}
        </p>
        <p>
          Last Updated:{' '}
          {exchangeRate
            ? new Date(exchangeRate.timestamp).toLocaleTimeString()
            : 'N/A'}
        </p>
      </div>
      <div>
        <h2>Coins</h2>
        {Object.values(coinPrices).map((coin) => (
          <CoinPriceDisplay key={coin.symbol} symbol={coin.symbol} />
        ))}
      </div>
    </div>
  );
} 