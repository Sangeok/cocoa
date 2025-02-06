import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import Navbar from '@/components/Navbar'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "코코아",
  description: "코인러들을 위한 코인 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            <Navbar />
            <main>
              {children}
            </main>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
