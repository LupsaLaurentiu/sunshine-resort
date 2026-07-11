import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css"
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sunshine Resort",
  description: "Premium adults-only boutique resort.",
};

export const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading",
});

export const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={cn(headingFont.variable, bodyFont.variable, "font-sans")}
    >
      <body>{children}</body>
    </html>
  );
}