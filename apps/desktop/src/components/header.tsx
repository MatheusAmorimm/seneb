"use client";

import { Menu, DollarSign, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useWorkspaceContext } from "../context/workspace_context";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { activeGroupId, setActiveGroupId, groups } = useWorkspaceContext();

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

      {groups && groups.length > 0 && (
        <div className="flex items-center gap-4">
          <select
            value={activeGroupId || "personal"}
            onChange={(e) => {
              const val = e.target.value;
              setActiveGroupId(val === "personal" ? null : val);
            }}
            className="bg-white/10 text-white border border-white/20 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F23E02]/50 transition-colors cursor-pointer outline-none appearance-none pr-8"
            style={{
               backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")",
               backgroundRepeat: "no-repeat",
               backgroundPosition: "right 0.7rem top 50%",
               backgroundSize: "0.65rem auto"
            }}
          >
            <option value="personal" className="text-black dark:text-white dark:bg-slate-800">💼 Visão Pessoal</option>
            {groups.map(group => (
              <option key={group.id} value={group.id} className="text-black dark:text-white dark:bg-slate-800">
                👥 {group.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </header>
  );
}