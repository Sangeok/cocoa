"use client";

import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";

export default function SystemWarning() {
  const warningTime = process.env.NEXT_PUBLIC_SYSTEM_WARNING_TIME;
  const isServerMaintaining = process.env.NEXT_PUBLIC_IS_SERVER_MAINTAINING === "true";
  const { theme } = useTheme();

  const getEndTimeDisplay = () => {
    if (!warningTime) return "미정";
    const endTime = new Date(warningTime);
    const now = new Date();
    
    if (endTime < now) return "미정";
    
    return endTime.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });
  };

  if (!isServerMaintaining) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center space-y-8 p-4">
        <div className="mb-12">
          <div className="relative w-24 h-24 mx-auto">
            <Image
              src="/icons/logo.webp"
              alt="코코아 심볼"
              width={96}
              height={96}
              className="object-contain"
              priority
            />
          </div>
          <div className="relative w-48 h-12 mx-auto">
            <Image
              src={theme === 'dark' ? "/icons/logo_white.webp" : "/icons/logo_black.webp"}
              alt="코코아"
              width={256}
              height={32}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">시스템 점검 중</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            더 나은 서비스 제공을 위해 시스템 점검을 진행하고 있습니다.
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            예상 종료 시간: <span className="font-bold text-blue-500">{getEndTimeDisplay()}</span>
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-600">
            이용에 불편을 드려 죄송합니다.
          </p>
        </div>
      </div>
    </div>
  );
} 