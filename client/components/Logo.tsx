"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Image src="/icons/logo.webp" alt="logo" width={24} height={24} />
      <span className="text-2xl font-bold text-gray-900 dark:text-white">
        코인코인코리아
      </span>
    </Link>
  );
}
