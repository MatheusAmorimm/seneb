"use client";

import { Menu, DollarSign, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    const isLocked = sessionStorage.getItem('seneb_edition_lock') === 'true';
    if (isLocked && !href.startsWith('/lancamentos')) {
      e.preventDefault();
      import('sonner').then(({ toast }) => {
        toast.error("Obrigatório: Finalize o mês reaberto antes de sair.", {
          duration: 5000,
          icon: <AlertTriangle className="text-red-500" />
        });
      });
      return;
    }
    // If not locked, allow navigation (if using buttons, we'd router.push here)
  };

  return (
    <header 
      className="text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-40" 
      style={{ background: 'linear-gradient(to right, #013750, #2C6B74)' }}
    >
      <div className="flex items-center gap-4">
        {/* Botão Hambúrguer */}
        <button 
          onClick={(e) => {
            const isLocked = sessionStorage.getItem('seneb_edition_lock') === 'true';
            if (isLocked) {
              e.preventDefault();
              import('sonner').then(({ toast }) => {
                toast.error("Obrigatório: Finalize o mês reaberto antes de sair.", {
                  duration: 5000,
                  icon: <AlertTriangle className="text-red-500" />
                });
              });
              return;
            }
            onMenuClick();
          }}
          className="p-2 rounded-lg transition-colors hover:bg-white/10 active:bg-white/20"
        >
          <Menu className="w-6 h-6" />
        </button>

         {/* Logo e Título (Clicável para Home) */}
        <Link 
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
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


    </header>
  );
}