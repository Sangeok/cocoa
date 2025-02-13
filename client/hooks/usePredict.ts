import { useEffect } from "react";
import usePredictStore from "@/store/usePredictStore";

export const usePredict = () => {
  const {
    activePredict,
    lastResult,
    isLoading,
    error,
    startPredict,
    clearError,
    reset,
    stats,
    fetchStats,
  } = usePredictStore();

  // Reset prediction state when component unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Calculate remaining time for active prediction
  const getRemainingTime = (): number => {
    if (!activePredict) return 0;
    const remaining = activePredict.finishedAt - Date.now();
    return remaining > 0 ? remaining : 0;
  };

  // Check if user can make a new prediction
  const canPredict = !activePredict && !isLoading;

  return {
    // State
    activePredict,
    lastResult,
    isLoading,
    error,
    remainingTime: getRemainingTime(),
    canPredict,

    // Actions
    startPredict,
    clearError,
    reset,
    fetchStats,
    stats,
  };
};
