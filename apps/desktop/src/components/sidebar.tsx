"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  Home, 
  PieChart, 
  History, 
  X, 
  ChevronDown, 
  ChevronRight, 
  FileText,
  PlusCircle 
} from "lucide-react";
import { cn } from "../lib/utils";
import { useReports } from "../hooks/use_reports";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Para ler o ?id=...
  const router = useRouter();
  
  const { reports, isLoading } = useReports();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // ID do relatório ativo na URL (se houver)
  const activeReportId = searchParams.get("id");

  const menuItems = [
    { 
      icon: Home, 
      label: "Início", 
      href: "/", 
      activeClass: "bg-[#FEF5C8] text-[#013750]",
      hoverClass: "hover:bg-[#FEF5C8] hover:text-[#013750]"
    },
    { 
      icon: PlusCircle, 
      label: "Lançamentos", 
      href: "/lancamentos", 
      activeClass: "bg-[#fff0e6] text-[#F23E02]", 
      hoverClass: "hover:bg-[#fff0e6] hover:text-[#F23E02]"
    },
  ];

  // Configurações visuais do Histórico
  const historyActive = pathname.includes("/historico");
  const historyStyles = {
    active: "bg-[#e0f7fa] text-[#00988D]",
    hover: "hover:bg-[#e0f7fa] hover:text-[#00988D]"
  };

  const analyticsActive = pathname === "/analytics";
  const analyticsStyles = {
    active: "bg-[#eef2ff] text-[#013750]",
    hover: "hover:bg-[#eef2ff] hover:text-[#013750]"
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside 
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b bg-brand-deepBlue border-gray-100">
          <span className="font-serif font-bold text-xl text-white">Menu</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-sans font-medium",
                  "text-gray-500",
                  item.hoverClass,
                  isActive && cn(item.activeClass, "font-bold shadow-sm")
                )}
              >
                <Icon size={20} className="transition-colors" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* ITEM HISTÓRICO */}
          <div className="space-y-1">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-sans font-medium",
                "text-gray-500", 
                historyStyles.hover,
                // CORREÇÃO AQUI: Removemos a restrição !isHistoryOpen. 
                // Se estiver na rota de histórico, mantém a cor sempre.
                historyActive && cn(historyStyles.active, "font-bold shadow-sm")
              )}
            >
              <History size={20} className="transition-colors" />
              <span className="flex-1 text-left">Histórico</span>
              {isHistoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Dropdown com Meses */}
            <div className={cn(
              "overflow-hidden transition-all duration-300 space-y-1",
              isHistoryOpen ? "max-h-96 opacity-100 py-1" : "max-h-0 opacity-0"
            )}>
              {isLoading ? (
                <div className="text-xs text-slate-400 animate-pulse px-8 py-2">Carregando...</div>
              ) : reports.length > 0 ? (
                reports.map((report) => {
                  // Verifica se este é o relatório que está na tela
                  const isActiveReport = report.id === activeReportId;

                  return (
                    <button
                      key={report.id}
                      onClick={() => {
                        router.push(`/historico?id=${report.id}`);
                        onClose();
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-8 py-2 text-sm transition-colors text-left border-l-2",
                        isActiveReport 
                          ? "text-[#00988D] font-bold border-[#00988D] bg-teal-50/50" // Estilo do item selecionado
                          : "text-slate-500 border-transparent hover:text-[#00988D] hover:border-[#00988D] hover:bg-teal-50"
                      )}
                    >
                      <FileText size={14} className={isActiveReport ? "fill-current" : ""} />
                      {report.name}
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 italic px-8 py-2">Sem histórico</div>
              )}
            </div>
          </div>

          <Link
            href="/analytics"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-sans font-medium",
              "text-gray-500",
              analyticsStyles.hover,
              analyticsActive && cn(analyticsStyles.active, "font-bold shadow-sm")
            )}
          >
            <PieChart size={20} className="transition-colors" />
            <span>Analytics</span>
          </Link>

        </nav>
      </aside>
    </>
  );
}