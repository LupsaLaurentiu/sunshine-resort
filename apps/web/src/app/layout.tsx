import type {
  Metadata,
} from "next";

import {
  Cormorant_Garamond,
  Manrope,
} from "next/font/google";

import {
  cn,
} from "@/lib/utils";

import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(
    siteUrl,
  ),

  title: {
    default:
      "Sunshine Resort",
    template:
      "%s | Sunshine Resort",
  },

  description:
    "Sunshine Resort este un resort boutique premium adults-only, creat pentru relaxare, intimitate și experiențe memorabile în natură.",

  applicationName:
    "Sunshine Resort",

  keywords: [
    "Sunshine Resort",
    "resort de lux",
    "resort romantic",
    "adults only",
    "resort boutique",
    "piscină cu apă sărată",
    "wellness",
    "relaxare",
    "Maramureș",
  ],

  authors: [
    {
      name:
        "Sunshine Resort",
    },
  ],

  creator:
    "Sunshine Resort",

  publisher:
    "Sunshine Resort",

  openGraph: {
    type:
      "website",

    siteName:
      "Sunshine Resort",

    title:
      "Sunshine Resort",

    description:
      "Resort boutique premium adults-only, creat pentru relaxare, intimitate și experiențe memorabile în natură.",

    locale:
      "ro_RO",

    alternateLocale: [
      "en_US",
    ],

    images: [
      {
        url:
          "/hero-mockup.jpg",

        width:
          1200,

        height:
          630,

        alt:
          "Sunshine Resort",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Sunshine Resort",

    description:
      "Resort boutique premium adults-only, creat pentru relaxare, intimitate și experiențe memorabile în natură.",

    images: [
      "/hero-mockup.jpg",
    ],
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },
};

export const headingFont =
  Cormorant_Garamond({
    subsets: [
      "latin",
    ],

    weight: [
      "300",
      "400",
      "500",
      "600",
      "700",
    ],

    variable:
      "--font-heading",

    display:
      "swap",
  });

export const bodyFont =
  Manrope({
    subsets: [
      "latin",
    ],

    variable:
      "--font-body",

    display:
      "swap",
  });

type RootLayoutProps = Readonly<{
  children:
    React.ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="ro"
      suppressHydrationWarning
      className={cn(
        headingFont.variable,
        bodyFont.variable,
        "font-sans",
      )}
    >
      <body className="min-h-screen bg-[#050505] text-[#f5f0e8] antialiased">
        {children}
      </body>
    </html>
  );
}