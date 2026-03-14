"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../../components/sidebar";
import { Header } from "../../../components/header";
import { useTheme } from "../../../components/theme_provider";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setIsHome, isSidebarOpen, setIsSidebarOpen } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setIsHome(false);
  }, [setIsHome]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, setIsSidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Fixo no Topo */}
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar (Overlay) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}