"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          {/* Logo and Description */}
          <div className="space-y-4 max-w-sm">
            <Logo size="sm" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              코코아(코인코인코리아)는 오픈소스로 공개 개발되었습니다. 코코아
              내의 모든 데이터는 실제 데이터와 차이가 있을 수 있습니다. 사이트
              내 모든 암호화폐 가격 및 투자 관련 정보에 대하여 어떠한 책임을
              부담하지 않습니다. 디지털 자산 투자는 전적으로 스스로의 책임이므로
              이에 유의하시기 바랍니다.
            </p>
          </div>

          {/* Right side links and copyright */}
          <div className="flex flex-col space-y-4 md:items-end">
            {/* Links */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Link
                href="/tos"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/pp"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="https://github.com/joshephan/cocoa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                소스코드
              </Link>
            </div>
            <Link
              href="https://nullenterprise.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Powered by NULL ENTERPRISE PTE. LTD.
            </Link>
            {/* Copyright */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} NULL ENTERPRISE PTE. LTD. All rights
              reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
