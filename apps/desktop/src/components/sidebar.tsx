"use client";

import { useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getStorageItem, removeStorageItem } from "../lib/storage";
import {
  Home,
  PieChart,
  History,
  Users,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  PlusCircle,
  Trash2,
  AlertTriangle,
  Target,
  UserCircle,
  LogOut
} from "lucide-react";
import { cn } from "../lib/utils";
import { useReports } from "../hooks/use_reports";
import api from "../services/api";
import { toast } from "sonner";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <Suspense fallback={null}>
      <SidebarContent isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
}

function SidebarContent({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { reports, isLoading, refetch } = useReports();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // --- Estados para o Modal Personalizado ---
  const [reportToDelete, setReportToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeReportId = searchParams.get("id");

  // 1. Apenas abre o modal, não deleta ainda
  const requestDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Não navega
    e.preventDefault();
    setReportToDelete({ id, name }); // Abre o modal
  };

  // 2. Executa a exclusão real
  const confirmDelete = async () => {
    if (!reportToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/reports/${reportToDelete.id}`);
      toast.success("Histórico excluído permanentemente.");
      
      // Se estava vendo esse relatório, volta pra home
      if (activeReportId === reportToDelete.id) {
        router.push("/historico");
      }
      
      await refetch();
      setReportToDelete(null); // Fecha modal
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir histórico.");
    } finally {
      setIsDeleting(false);
    }
  };

  const menuItems = [
    { 
      icon: Home, 
      label: "Início", 
      href: "/", 
      activeClass: "bg-[#FEF5C8] text-[#013750] dark:bg-slate-800 dark:text-slate-100",
      hoverClass: "hover:bg-[#FEF5C8] hover:text-[#013750] dark:hover:bg-slate-800 dark:hover:text-slate-200"
    },
    { 
      icon: PlusCircle, 
      label: "Lançamentos", 
      href: "/lancamentos", 
      activeClass: "bg-[#fff0e6] text-[#F23E02] dark:bg-orange-950/30 dark:text-orange-400", 
      hoverClass: "hover:bg-[#fff0e6] hover:text-[#F23E02] dark:hover:bg-orange-950/20 dark:hover:text-orange-300"
    },
    {
      icon: Target,
      label: "Metas",
      href: "/metas",
      activeClass: "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
      hoverClass: "hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-amber-950/20 dark:hover:text-amber-300"
    },
    {
      icon: Users,
      label: "Meus Grupos",
      href: "/grupos",
      activeClass: "bg-[#eef2ff] text-[#013750] dark:bg-indigo-950/30 dark:text-indigo-400",
      hoverClass: "hover:bg-[#eef2ff] hover:text-[#013750] dark:hover:bg-indigo-950/20 dark:hover:text-indigo-300"
    },
  ];

  const historyActive = pathname.includes("/historico");
  const historyStyles = {
    active: "bg-[#e0f7fa] text-[#00988D] dark:bg-teal-950/30 dark:text-teal-400",
    hover: "hover:bg-[#e0f7fa] hover:text-[#00988D] dark:hover:bg-teal-950/20 dark:hover:text-teal-300"
  };

  const analyticsActive = pathname === "/analytics";
  const analyticsStyles = {
    active: "bg-[#eef2ff] text-[#013750] dark:bg-indigo-950/30 dark:text-indigo-400",
    hover: "hover:bg-[#eef2ff] hover:text-[#013750] dark:hover:bg-indigo-950/20 dark:hover:text-indigo-300"
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-150",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside 
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-150 ease-in-out flex flex-col border-r border-transparent dark:border-slate-800",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b bg-brand-deepBlue dark:bg-slate-950 border-gray-100 dark:border-slate-800">
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
              <button
                key={item.href}
                onClick={() => {
                  const isLocked = sessionStorage.getItem('seneb_edition_lock') === 'true';
                  if (isLocked && item.href !== '/lancamentos') {
                    toast.error("Obrigatório: Finalize o mês reaberto antes de sair.", {
                      duration: 5000,
                      icon: <AlertTriangle className="text-red-500" />
                    });
                    return;
                  }
                  router.push(item.href);
                  onClose();
                }}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-sans font-medium cursor-pointer",
                  "text-gray-500 dark:text-slate-400",
                  item.hoverClass,
                  isActive && cn(item.activeClass, "font-bold shadow-sm")
                )}
              >
                <Icon size={20} className="transition-colors" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* ITEM HISTÓRICO */}
          <div className="space-y-1">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-sans font-medium",
                "text-gray-500 dark:text-slate-400", 
                historyStyles.hover,
                historyActive && cn(historyStyles.active, "font-bold shadow-sm")
              )}
            >
              <History size={20} className="transition-colors" />
              <span className="flex-1 text-left">Histórico</span>
              {isHistoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Dropdown com Meses */}
            <div className={cn(
              "overflow-hidden transition-all duration-150 space-y-1",
              isHistoryOpen ? "max-h-96 opacity-100 py-1" : "max-h-0 opacity-0"
            )}>
              {isLoading ? (
                <div className="text-xs text-slate-400 animate-pulse px-8 py-2">Carregando...</div>
              ) : reports.length > 0 ? (
                reports.map((report) => {
                  const isActiveReport = report.id === activeReportId;

                  return (
                    <div
                        key={report.id}
                        className={cn(
                            "group/item flex items-center justify-between pr-2 pl-8 py-2 text-sm transition-colors border-l-2 cursor-pointer",
                            isActiveReport 
                              ? "text-[#00988D] dark:text-teal-400 font-bold border-[#00988D] dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/30" 
                              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-[#00988D] dark:hover:text-teal-300 hover:border-[#00988D] dark:hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20"
                        )}
                        onClick={() => {
                            const isLocked = sessionStorage.getItem('seneb_edition_lock') === 'true';
                            if (isLocked) {
                              toast.error("Obrigatório: Finalize o mês reaberto antes de sair.", {
                                duration: 5000,
                                icon: <AlertTriangle className="text-red-500" />
                              });
                              return;
                            }
                            router.push(`/historico?id=${report.id}`);
                            onClose();
                        }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                          <FileText size={14} className={isActiveReport ? "fill-current flex-shrink-0" : "flex-shrink-0"} />
                          <span className="truncate">{report.name}</span>
                      </div>

                      <button
                        onClick={(e) => requestDelete(e, report.id, report.name)}
                        className="opacity-0 group-hover/item:opacity-100 p-1.5 rounded-md hover:bg-red-100 text-red-400 hover:text-red-600 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 italic px-8 py-2">Sem histórico</div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              const isLocked = sessionStorage.getItem('seneb_edition_lock') === 'true';
              if (isLocked) {
                toast.error("Obrigatório: Finalize o mês reaberto antes de sair.", {
                  duration: 5000,
                  icon: <AlertTriangle className="text-red-500" />
                });
                return;
              }
              router.push('/analytics');
              onClose();
            }}
            className={cn(
              "w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-sans font-medium cursor-pointer",
              "text-gray-500 dark:text-slate-400",
              analyticsStyles.hover,
              analyticsActive && cn(analyticsStyles.active, "font-bold shadow-sm")
            )}
          >
            <PieChart size={20} className="transition-colors" />
            <span>Analytics</span>
          </button>

        </nav>

        {/* Rodapé: Perfil e Logout */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button
            onClick={() => {
              const isLocked = sessionStorage.getItem('seneb_edition_lock') === 'true';
              if (isLocked) {
                toast.error("Obrigatório: Finalize o mês reaberto antes de sair.", {
                  duration: 5000,
                  icon: <AlertTriangle className="text-red-500" />
                });
                return;
              }
              router.push('/perfil');
              onClose();
            }}
            className={cn(
              "w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sans font-medium cursor-pointer",
              "text-gray-500 dark:text-slate-400",
              pathname === '/perfil'
                ? "bg-slate-100 dark:bg-slate-800 text-brand-deepBlue dark:text-slate-100 font-bold shadow-sm"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-deepBlue dark:hover:text-slate-200"
            )}
          >
            <UserCircle size={20} />
            <span>Meu Perfil</span>
          </button>

          <button
            onClick={async () => {
              try {
                const refreshToken = await getStorageItem<string>("refresh_token");
                if (refreshToken) {
                  await api.post("/auth/logout", { refresh_token: refreshToken }).catch(() => {});
                }
                await removeStorageItem("token");
                await removeStorageItem("refresh_token");
                await removeStorageItem("user");
                api.defaults.headers.common['Authorization'] = undefined;
                toast.info("Sessão encerrada.");
                window.location.href = "/login";
              } catch {
                toast.error("Erro ao encerrar sessão.");
              }
            }}
            className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sans font-medium cursor-pointer text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      {reportToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#012a3d] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 scale-100 border border-slate-100 dark:border-slate-800">
            
            <div className="bg-red-50 dark:bg-red-950/20 p-6 flex flex-col items-center text-center gap-4 border-b border-red-100 dark:border-red-900/30">
              <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded-full">
                <AlertTriangle className="text-brand-orange w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-brand-deepBlue dark:text-slate-100">Excluir Histórico?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Você está prestes a apagar <strong>&quot;{reportToDelete.name}&quot;</strong>.
                  <br/>
                  <span className="text-red-600 dark:text-red-400 font-bold text-xs mt-1 block">ISSO NÃO PODE SER DESFEITO.</span>
                </p>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-[#012a3d] flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full py-3 bg-[#F23E02] hover:bg-[#d93602] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Excluindo...' : (
                  <>
                    <Trash2 size={18} />
                    Sim, excluir tudo
                  </>
                )}
              </button>
              
              <button
                onClick={() => setReportToDelete(null)}
                disabled={isDeleting}
                className="w-full py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}