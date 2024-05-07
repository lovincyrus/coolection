import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "sonner";

import { fontSans } from "@/lib/fonts";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Coolection",
  description: "Generated by create next app",
  // See: https://stackoverflow.com/questions/2989263/disable-auto-zoom-in-input-text-tag-safari-on-iphone
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
