import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";

export function Navbar() {
  return (
    // Adicionado flex-wrap e gap-y-4 para evitar quebra em telas pequenas
    <nav className="absolute top-0 left-0 w-full p-6 flex flex-wrap justify-between items-center gap-y-4 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* Logo Seneb com Ponto Laranja */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#013750] rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg">
          S
        </div>
        <span className="text-[#013750] font-serif font-bold text-xl tracking-wide">
          Seneb<span className="text-[#F23E02]">.</span>
        </span>
      </div>

      {/* Ações do Usuário Logado */}
      <div className="flex items-center gap-3">
        
        {/* Botão Perfil */}
        <Link 
          href="/perfil"
          className="flex items-center gap-2 px-4 py-2 text-[#013750] font-medium hover:bg-white/50 rounded-lg transition-all text-sm group"
        >
          <UserCircle size={20} className="text-[#013750] group-hover:text-[#F23E02] transition-colors" />
          <span>Meu Perfil</span>
        </Link>

        {/* Separador Visual */}
        <div className="h-6 w-px bg-slate-300 mx-1"></div>

        {/* Botão Sair */}
        <Link 
          href="/login" 
          className="flex items-center gap-2 px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-all text-sm"
          title="Sair da conta"
        >
          <span>Sair</span>
          <LogOut size={18} />
        </Link>
        
      </div>
    </nav>
  );
}