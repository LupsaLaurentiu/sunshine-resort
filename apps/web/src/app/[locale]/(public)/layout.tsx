import type { ReactNode } from "react";

import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { Footer } from "@/components/layout/public/Footer";
import { Navbar } from "@/components/layout/public/Navbar";
import { ScrollToTop } from "@/components/layout/public/ScrollToTop";

type PublicWebsiteLayoutProps = {
  children: ReactNode;
};

export default function PublicWebsiteLayout({
  children,
}: PublicWebsiteLayoutProps) {
  return (
    <SmoothScroll>
      <Navbar />

      <ScrollToTop />

      {children}

      <Footer />
    </SmoothScroll>
  );
}