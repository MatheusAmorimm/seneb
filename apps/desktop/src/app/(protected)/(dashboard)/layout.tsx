"use client";

import { useState } from "react";
import { Sidebar } from "../../../components/sidebar";
import { Header } from "../../../components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}