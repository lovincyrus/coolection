import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { ViewTransitions } from "next-view-transitions";

import { fontSans } from "@/lib/fonts";

import { ClipboardUrlSuggestion } from "./components/clipboard-url-suggestion";
import { Sidebar } from "./components/sidebar";
import { TailwindIndicator } from "./components/tailwind-indicator";
import { ThemedToaster } from "./components/themed-toaster";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Coolection · A better way to organize your favorite links",
  description: "Coolection makes organizing your favorite links easy.",
  openGraph: {
    type: "website",
    url: "https://coolection.co",
    title: "Coolection · A better way to organize your favorite links",
    description: "Coolection makes organizing your favorite links easy.",
    images: [
      {
        url: "https://coolection.co/og-image.jpg",
        alt: "Coolection",
      },
    ],
    siteName: "Coolection",
    locale: "en_US",
  },
};

// See: https://stackoverflow.com/questions/2989263/disable-auto-zoom-in-input-text-tag-safari-on-iphone
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={fontSans.className}>
          <Providers>
            <ThemedToaster />
            <ClipboardUrlSuggestion />
            <Analytics />
            <div className="flex">
              <Sidebar />
              <div className="flex-1">{children}</div>
            </div>
            <TailwindIndicator />
            <SpeedInsights />
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
