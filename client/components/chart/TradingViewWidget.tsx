"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { useEffect, useRef, memo, useState } from "react";

let tvScriptLoadingPromise: Promise<void>;

interface TradingViewWidgetProps {
  symbol: string;
  exchange?: string;
}

function TradingViewWidget({
  symbol,
  exchange = "UPBIT",
}: TradingViewWidgetProps) {
  const onLoadScriptRef = useRef<(() => void) | null>(null);
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";

        script.onload = () => resolve();

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => {
      onLoadScriptRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };

    function createWidget() {
      if (
        document.getElementById("tradingview-widget") &&
        "TradingView" in window
      ) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: `${exchange}:${symbol}`,
          interval: "1",
          timezone: "Asia/Seoul",
          theme: theme === "dark" ? "dark" : "light",
          style: "1",
          locale: "kr",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview-widget",
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          hide_legend: false,
          save_image: true,
          studies: ["Volume@tv-basicstudies"],
          backgroundColor:
            theme === "dark" ? "rgba(19, 23, 34, 1)" : "rgba(255, 255, 255, 1)",
          gridColor:
            theme === "dark"
              ? "rgba(42, 46, 57, 0.2)"
              : "rgba(42, 46, 57, 0.1)",
          hide_volume: false,
          preset: "crypto",
          show_popup_button: true,
          toolbar: true,
          details: true,
          charts_storage_url: "https://saveload.tradingview.com",
          charts_storage_api_version: "1.1",
          client_id: "tradingview.com",
          user_id: "public_user_id",
          fullscreen: true,
          studies_overrides: {},
          loading_screen: {
            backgroundColor:
              theme === "dark"
                ? "rgba(19, 23, 34, 1)"
                : "rgba(255, 255, 255, 1)",
          },
        });
      }
    }
  }, [symbol, exchange, theme]);

  return (
    <div 
      className="relative w-full" 
      style={{ 
        height: "clamp(400px, calc(100vh - 160px), 800px)",  // 최소 400px, 최대 800px, 기본값은 100vh - 160px
      }}
    >
      <div
        id="tradingview-widget"
        className="w-full h-full"
        ref={containerRef}
      />
    </div>
  );
}

export default memo(TradingViewWidget);
