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
      text: "text-xl",
    },
    md: {
      icon: 24,
      text: "text-3xl",
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
      <Image
        className="hidden dark:block"
        src="/icons/cocoa_white.webp"
        alt="코코아 로고"
        width={100}
        height={21}
      />
      <Image
        className="block dark:hidden"
        src="/icons/cocoa_black.webp"
        alt="코코아 로고"
        width={100}
        height={21}
      />
    </Link>
  );
}
