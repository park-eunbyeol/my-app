import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "카페드림 - 사장님의 여유를 위한 카페 마케팅 전문가",
  description: "네이버 플레이스, 인스타그램, CRM까지 카페 매출의 모든 솔루션을 제공합니다.",
  openGraph: {
    title: "카페드림 - 사장님의 여유를 위한 카페 마케팅 전문가",
    description: "텅 빈 테이블을 웨이팅 라인으로 만드는 단골 마케팅의 정석. 지도 노출부터 단골 관리까지, 사장님은 커피만 내리세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "카페드림 - 카페 마케팅 전문가",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "카페드림 - 사장님의 여유를 위한 카페 마케팅 전문가",
    description: "텅 빈 테이블을 웨이팅 라인으로 만드는 단골 마케팅의 정석",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body suppressHydrationWarning>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}