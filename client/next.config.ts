import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // 빌드 중 ESLint 검사 무시
  },
  typescript: {
    ignoreBuildErrors: true, // 빌드 중 TypeScript 에러 무시
  },
};

export default nextConfig;
