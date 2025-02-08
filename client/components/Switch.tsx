"use client";

import { Switch as HeadlessSwitch } from "@headlessui/react";
import { clsx } from "clsx";

interface SwitchProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Switch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className,
  children,
}: SwitchProps) {
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {children}
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          "group relative flex h-7 w-14 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-white/25",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          checked ? "bg-gray-200 dark:bg-white/10" : "bg-gray-100 dark:bg-white/10"
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-7" : "translate-x-0"
          )}
        />
      </HeadlessSwitch>
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
          )}
          {description && (
            <div className="text-sm text-gray-500 dark:text-white/50">{description}</div>
          )}
        </div>
      )}
    </div>
  );
}
