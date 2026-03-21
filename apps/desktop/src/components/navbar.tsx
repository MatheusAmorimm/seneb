"use client";

import { useRouter } from "next/navigation";
import { LogOut, AlertTriangle } from "lucide-react";
import { removeStorageItem } from "../lib/storage";
import { toast } from "sonner";
import api from "../services/api";

export function Navbar() {
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {

      await removeStorageItem("token");
      await removeStorageItem("user");


      api.defaults.headers.common['Authorization'] = undefined;

      toast.info("Sessão encerrada.");

      window.location.href = "/login";

    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão.");
    }
  };

  return (
    <nav className="absolute top-0 left-0 w-full p-6 flex flex-wrap justify-between items-center gap-y-4 z-50 animate-in fade-in slide-in-from-top-4 duration-700">

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#013750] dark:bg-slate-100 rounded-lg flex items-center justify-center text-white dark:text-[#013750] font-serif font-bold text-xl shadow-lg transition-colors">
          S
        </div>
        <span className="text-[#013750] dark:text-slate-100 font-serif font-bold text-xl tracking-wide transition-colors">
          Seneb<span className="text-[#F23E02]">.</span>
        </span>
      </div>

      <div className="flex items-center gap-3">


        <button
          onClick={(e) => {
            const isLocked = sessionStorage.getItem('seneb_edition_lock') === 'true';
            if (isLocked) {
              e.preventDefault();
              toast.error("Obrigatório: Finalize o mês reaberto antes de sair.", {
                duration: 5000,
                icon: <AlertTriangle className="text-red-500" />
              });
              return;
            }
            handleLogout(e);
          }}
          className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all text-sm cursor-pointer"
          title="Sair da conta"
        >
          <span>Sair</span>
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}