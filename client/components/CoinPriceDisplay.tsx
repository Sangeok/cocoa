import { useCoinPrice, useExchangeRate } from '@/store/useMarketStore';

export function CoinPriceDisplay({ symbol }: { symbol: string }) {
  const coinData = useCoinPrice(symbol);
  const exchangeRate = useExchangeRate();

  if (!coinData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{coinData.symbol}</h2>
      <div>
        <p>Upbit Price: ₩{coinData.upbitPrice?.toLocaleString()}</p>
        <p>
          Binance Price: ${coinData.binancePrice?.toLocaleString()} (₩
          {exchangeRate
            ? (coinData.binancePrice! * exchangeRate.rate).toLocaleString()
            : 'N/A'}
          )
        </p>
        <p>Price Difference: {coinData.difference.toFixed(2)}%</p>
        <p>
          Last Updated: {new Date(coinData.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
} 