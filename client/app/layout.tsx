import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const font = localFont({
  src: [
    {
      path: "../public/fonts/42dotSans/42dotSans-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/42dotSans/42dotSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/42dotSans/42dotSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-42dot",
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
    <html lang="ko">
      <body
        className={`${font.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
