"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, History, X } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Início", href: "/", color: "text-[#F23E02]" },
  { icon: Home, label: "Lançamentos", href: "/lancamentos", color: "text-[#F23E02]" }, // Adicionei para navegação interna
  { icon: History, label: "Histórico", href: "/historico", color: "text-[#00988D]" },
  { icon: PieChart, label: "Analytics", href: "/analytics", color: "text-[#013750]" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 1. O Fundo Escuro (Backdrop) */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose} // Fecha ao clicar fora
      />

      {/* 2. A Gaveta Lateral */}
      <aside 
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Cabeçalho da Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <span className="font-serif font-bold text-xl text-[#013750]">Menu</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose} // Fecha ao clicar no link
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive ? "bg-[#FEF5C8]" : "hover:bg-gray-50"
                )}
              >
                <Icon 
                  size={20} 
                  className={cn(
                    "transition-colors",
                    isActive ? item.color : "text-gray-400 group-hover:text-gray-600"
                  )} 
                />
                <span className={cn(
                  "font-sans font-medium",
                  isActive ? "text-[#013750]" : "text-gray-600"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}