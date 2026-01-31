"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { removeStorageItem } from "../lib/storage";
import { toast } from "sonner";

export function Navbar() {
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault(); // Impede a navegação imediata do Link

    try {
      // Limpamos o token e os dados do usuário do armazenamento nativo (.json)
      await removeStorageItem("token");
      await removeStorageItem("user");

      toast.info("Sessão encerrada.");
      
      // Redireciona para o login e limpa o histórico de navegação
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão.");
    }
  };

  return (
    <nav className="absolute top-0 left-0 w-full p-6 flex flex-wrap justify-between items-center gap-y-4 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#013750] rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg">
          S
        </div>
        <span className="text-[#013750] font-serif font-bold text-xl tracking-wide">
          Seneb<span className="text-[#F23E02]">.</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          href="/perfil"
          className="flex items-center gap-2 px-4 py-2 text-[#013750] font-medium hover:bg-white/50 rounded-lg transition-all text-sm group" 
        >
          <UserCircle size={20} className="text-[#013750] group-hover:text-[#F23E02] transition-colors" /> 
          <span>Meu Perfil</span>
        </Link>

        <div className="h-6 w-px bg-slate-300 mx-1"></div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-all text-sm cursor-pointer" 
          title="Sair da conta"
        >
          <span>Sair</span>
          <LogOut size={18} /> 
        </button>
      </div>
    </nav>
  );
}