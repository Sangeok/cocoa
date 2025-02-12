"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md";
}

export default function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: {
      icon: 20,
      text: "text-lg",
    },
    md: {
      icon: 24,
      text: "text-2xl",
    },
  };

  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/icons/logo.webp"
        alt="logo"
        width={sizes[size].icon}
        height={sizes[size].icon}
      />
      <span
        className={`${sizes[size].text} font-bold text-gray-900 dark:text-white`}
      >
        COCOA
      </span>
    </Link>
  );
}
