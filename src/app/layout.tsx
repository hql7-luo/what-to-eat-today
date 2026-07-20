import type { Metadata, Viewport } from "next";

import { AppHeader } from "@/components/app-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "今天吃什么｜少做选择，快速开饭",
    template: "%s｜今天吃什么",
  },
  description: "回答几个问题，用一场有趣的开箱抽取快速决定今天吃什么。无需定位或登录，偏好仅保存在本机。",
  applicationName: "今天吃什么",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f1e4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-full bg-ink-900 px-4 py-2 text-sm font-bold text-white transition-transform focus:translate-y-0"
        >
          跳到主要内容
        </a>
        <AppHeader />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
