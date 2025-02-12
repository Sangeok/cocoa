'use client';

import { useEffect, useRef, memo } from 'react';

let tvScriptLoadingPromise: Promise<void>;

interface TradingViewWidgetProps {
  symbol: string;
  exchange?: string;
}

function TradingViewWidget({ symbol, exchange = 'UPBIT' }: TradingViewWidgetProps) {
  const onLoadScriptRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById('tradingview-widget') && 'TradingView' in window) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: `${exchange}:${symbol}`,
          interval: 'D',
          timezone: 'Asia/Seoul',
          theme: 'dark',
          style: '1',
          locale: 'kr',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: 'tradingview-widget',
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          backgroundColor: 'rgba(0, 0, 0, 1)',
          gridColor: 'rgba(42, 46, 57, 1)',
          hide_volume: false,
        });
      }
    }
  }, [symbol, exchange]);

  return (
    <div className='relative w-full' style={{ height: 'calc(100vh - 200px)' }}>
      <div id='tradingview-widget' className='w-full h-full' />
    </div>
  );
}

export default memo(TradingViewWidget); 