import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "小猫AI图片编辑 - 代替PS的AI图片编辑工具",
  description: "小猫AI图片编辑，采用最先进的图片大模型，保持图片一致性，拥有顶级的AI图片编辑体验。支持智能风格转换、提示词编辑、老照片上色等多种AI功能。",
  keywords: "AI图片编辑,人工智能图片处理,智能风格转换,提示词编辑,老照片上色,图片风格化,AI图像生成",
  authors: [{ name: "小猫AI图片编辑团队" }],
  creator: "小猫AI图片编辑",
  publisher: "小猫AI图片编辑",
  applicationName: "小猫AI图片编辑",
  openGraph: {
    title: "小猫AI图片编辑 - 代替PS的AI图片编辑工具",
    description: "采用最先进的图片大模型，保持图片一致性，拥有顶级的AI图片编辑体验",
    type: "website",
    locale: "zh_CN",
    siteName: "小猫AI图片编辑"
  },
  twitter: {
    card: "summary_large_image",
    title: "小猫AI图片编辑 - 代替PS的AI图片编辑工具",
    description: "采用最先进的图片大模型，保持图片一致性，拥有顶级的AI图片编辑体验"
  }
};

const stagewiseConfig = {
  plugins: []
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          {process.env.NODE_ENV === 'development' && (
            <StagewiseToolbar config={stagewiseConfig} />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
