import type { Metadata } from "next";
import { Public_Sans, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "แจ้งเรื่องร้องเรียน - กลุ่มงานคุ้มครองผู้บริโภคฯ สมุทรปราการ",
  description: "ระบบรับเรื่องร้องเรียน สำนักงานสาธารณสุขจังหวัดสมุทรปราการ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${publicSans.variable} ${notoSansThai.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" />
      </head>
      <body className="antialiased font-body bg-background-light text-text-main min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
