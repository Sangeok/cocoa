"use client";

import { useEffect, useState } from "react";

export default function SystemWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const warningTime = process.env.NEXT_PUBLIC_SYSTEM_WARNING_TIME;

  useEffect(() => {
    const checkWarningTime = () => {
      if (!warningTime) return;
      
      const warningEndTime = new Date(warningTime).getTime();
      const now = new Date().getTime();
      
      setShowWarning(now < warningEndTime);
    };

    checkWarningTime();
    const interval = setInterval(checkWarningTime, 1000);

    return () => clearInterval(interval);
  }, [warningTime]);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white py-2 text-center z-50">
      <p className="text-sm">
        시스템 점검 중입니다. (
        {new Date(warningTime!).toLocaleString("ko-KR", {
          timeZone: "Asia/Seoul",
        })}
        까지)
      </p>
    </div>
  );
} 