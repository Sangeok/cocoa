"use client";

import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/callback`;
    const scope = "email profile";

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.location.href = url;
  };

  const handleNaverLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/auth/naver/callback`;
    const state = Math.random().toString(36).substring(7);

    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            코코아 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            소셜 계정으로 간편하게 로그인하세요.
            <br />
            회원가입시 코코아의{" "}
            <Link href="/pp" className="text-blue-500">
              이용약관
            </Link>{" "}
            및{" "}
            <Link href="/tos" className="text-blue-500">
              개인정보처리방침
            </Link>{" "}
            에 동의하게 됩니다.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 
                     dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Image
              src="/icons/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            <span className="text-gray-700 dark:text-gray-200 font-bold">
              Google로 계속하기
            </span>
          </button>

          {/* <button
            onClick={handleNaverLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 
                     bg-[#03C75A] hover:bg-[#02b351] rounded-lg shadow-sm transition-colors"
          >
            <Image src="/icons/naver.svg" alt="Naver" width={20} height={20} />
            <span className="text-white font-bold">네이버로 계속하기</span>
          </button> */}
        </div>
      </div>
    </div>
  );
}
