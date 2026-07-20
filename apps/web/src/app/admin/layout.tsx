import type { Metadata } from "next";

import { AdminAuthProvider } from "@/hooks/useAdminAuth";

export const metadata: Metadata = {
  title: "Sunshine Resort Admin",
  description: "Panoul administrativ Sunshine Resort.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-[#050505] text-[#f5f2eb]">
        {children}
      </div>
    </AdminAuthProvider>
  );
}