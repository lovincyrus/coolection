import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { fontSans } from "@/lib/fonts";

import { TailwindIndicator } from "./components/tailwind-indicator";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Coolection",
  description: "An open-source bookmarking tool.",
  openGraph: {
    type: "website",
    url: "https://coolection.co",
    title: "Coolection",
    description: "An open-source bookmarking tool.",
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
  themeColor: "#FFFFFF",
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
    <html lang="en">
      <body className={fontSans.className}>
        <Providers>
          <Toaster />
          <Analytics />
          {children}
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  );
}
