import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Navbar from "@/components/fixed/Navbar";
import Footer from "@/components/fixed/Footer";
import MarketTicker from "@/components/fixed/MarketTicker";
import { Toaster } from 'react-hot-toast';

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
  title: "코코아 | 코인코인코리아",
  description: "암호화폐 차익거래 기회를 실시간으로 모니터링하세요",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/og.png",
  },
  openGraph: {
    title: "코코아 | 코인코인코리아",
    description: "암호화폐 차익거래 기회를 실시간으로 모니터링하세요",
    images: [
      {
        url: "/icons/og.png",
        width: 800,
        height: 600,
        alt: "코코아",
      },
    ],
    type: "website",
    siteName: "코코아 | 코인코인코리아",
    locale: "ko",
    url: "https://cocoacoin.kr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PBSLT3K9');
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7KX9DZ3J0H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-7KX9DZ3J0H');
          `}
        </Script>
      </head>
      <body
        className={`${font.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PBSLT3K9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider>
          <Navbar />
          <MarketTicker />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
