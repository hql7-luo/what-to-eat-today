import type { Metadata, Viewport } from "next";

import { AppHeader } from "@/components/app-header";
import { LocaleSync } from "@/components/locale-sync";

import "./globals.css";

// The tab title is rendered by <LocaleSync /> so it follows the visitor's language.
export const metadata: Metadata = {
  description: "回答几个问题，用一场有趣的开箱抽取快速决定今天吃什么。无需定位或登录，偏好仅保存在本机。Answer a few questions and let a fun draw pick today's meal. No location or sign-in; preferences stay on your device.",
  applicationName: "今天吃什么 · What to Eat Today",
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
        <LocaleSync />
        <AppHeader />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
