"use client";

import { Switch as HeadlessSwitch } from "@headlessui/react";
import { clsx } from "clsx";

interface SwitchProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}

export default function Switch({
  label,
  description,
  checked,
  onChange,
  children,
}: SwitchProps) {
  return (
    <HeadlessSwitch.Group as="div" className="flex items-center">
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        className={clsx(
          checked
            ? "bg-gray-600 dark:bg-gray-400"
            : "bg-gray-200 dark:bg-gray-800",
          "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2"
        )}
      >
        <span
          className={clsx(
            checked ? "translate-x-4" : "translate-x-0",
            "pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        >
          {children}
        </span>
      </HeadlessSwitch>
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {label}
            </div>
          )}
          {description && (
            <div className="text-sm text-gray-500 dark:text-white/50">
              {description}
            </div>
          )}
        </div>
      )}
    </HeadlessSwitch.Group>
  );
}
