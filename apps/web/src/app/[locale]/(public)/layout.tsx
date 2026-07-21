import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { Footer } from "@/components/layout/public/Footer";
import { Navbar } from "@/components/layout/public/Navbar";
import { ScrollToTop } from "@/components/layout/public/ScrollToTop";

export default function PublicWebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <SmoothScroll />
      <ScrollToTop />

      {children}

      <Footer />
    </>
  );
}