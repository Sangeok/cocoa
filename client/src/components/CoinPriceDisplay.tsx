import { useCoinPrice } from '@/hooks/useCoinPrice';

export function CoinPriceDisplay() {
  const coinData = useCoinPrice();

  if (!coinData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{coinData.symbol}</h2>
      <p>Price: {coinData.price}</p>
      <p>Difference: {coinData.difference}</p>
      <p>Last Updated: {new Date(coinData.timestamp).toLocaleString()}</p>
    </div>
  );
} 