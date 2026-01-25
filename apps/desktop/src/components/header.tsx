import { Menu, DollarSign } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header 
      className="text-white p-4 shadow-lg flex items-center gap-4 sticky top-0 z-40" 
      style={{ background: 'linear-gradient(to right, #013750, #2C6B74)' }}
    >
      {/* Botão Hambúrguer */}
      <button 
        onClick={onMenuClick}
        className="p-2 rounded-lg transition-colors hover:bg-white/10 active:bg-white/20"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo e Título */}
      <div className="flex items-center gap-2">
        <div className="bg-white/10 p-2 rounded-full">
           <DollarSign className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-serif font-bold tracking-wide">
          Seneb<span className="text-[#F23E02]">.</span>
        </h1>
      </div>
    </header>
  );
}