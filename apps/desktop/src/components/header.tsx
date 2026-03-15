"use client";

import { Menu, DollarSign, User } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header 
      className="text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-40" 
      style={{ background: 'linear-gradient(to right, #013750, #2C6B74)' }}
    >
      <div className="flex items-center gap-4">
        {/* Botão Hambúrguer */}
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg transition-colors hover:bg-white/10 active:bg-white/20"
        >
          <Menu className="w-6 h-6" />
        </button>

         {/* Logo e Título (Clicável para Home) */}
        <Link 
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-white no-underline"
        >
          <div className="bg-white/10 p-2 rounded-full">
             <DollarSign className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-serif font-bold tracking-wide">
            Seneb<span className="text-[#F23E02]">.</span>
          </h1>
        </Link>
      </div>

      {/* Botão Perfil - No Header para maior visibilidade */}
      <Link 
        href="/perfil/"
        className="p-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 group cursor-pointer text-white no-underline"
        title="Meu Perfil"
      >
        <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Meu Perfil</span>
        <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-[#00988D] transition-colors">
          <User className="w-4 h-4 text-white" />
        </div>
      </Link>
    </header>
  );
}