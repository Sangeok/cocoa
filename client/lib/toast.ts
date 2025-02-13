import toast from "react-hot-toast";
import { PredictResult } from "@/types/predict";
import { PredictResultToast } from "@/components/toast/PredictResultToast";
import React from "react";

export const showPredictResultToast = (result: PredictResult) => {
  toast.custom(
    (t: any) =>
      React.createElement(PredictResultToast, {
        result,
        className: `max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg 
        pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 
        dark:ring-white dark:ring-opacity-10
        ${t.visible ? "animate-enter" : "animate-leave"}`,
      }),
    {
      duration: 4000,
      position: "bottom-right",
    }
  );
};
