import { Navbar } from "@/components/layout/public/Navbar";
import { Footer } from "@/components/layout/public/Footer";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { ScrollToTop } from "@/components/layout/public/ScrollToTop";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />
      <SmoothScroll/>
      <ScrollToTop/>
      {children}
      <Footer />
    </div>
  );
}