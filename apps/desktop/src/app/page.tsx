import Link from "next/link";
import { PlusCircle, History, BarChart3, ArrowRight } from "lucide-react";
import { Navbar } from "../components/navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <Navbar />
      {/* Saudação e Cabeçalho */}
      <div className="text-center space-y-4 mb-16 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#013750]">
          Olá, <span className="text-[#2C6B74]">Robot!</span>
        </h1>
        <p className="text-lg text-slate-600 font-sans">
          Bem-vindo de volta ao seu controle financeiro. <br />
          Por onde deseja começar hoje?
        </p>
      </div>

      {/* Grid de Navegação (Os 3 Cards Principais) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        
        {/* CARD 1: Lançamentos (Leva para a tela com Sidebar) */}
        <Link 
          href="/lancamentos"
          className="group relative bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-[#ffe4d6] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
          {/* Efeito de brilho laranja no fundo */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#fff0e6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#F23E02]/10 flex items-center justify-center mb-6 group-hover:bg-[#F23E02] transition-colors duration-300">
              <PlusCircle className="w-8 h-8 text-[#F23E02] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#013750] mb-2">
              Lançamentos
            </h3>
            <p className="text-slate-500 text-sm">
              Adicione receitas e despesas do mês atual.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[#F23E02] font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Acessar</span>
            <ArrowRight size={18} />
          </div>
        </Link>

        {/* CARD 2: Histórico */}
        <Link 
          href="/historico"
          className="group relative bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-[#cceae8] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#e0f7fa] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#00988D]/10 flex items-center justify-center mb-6 group-hover:bg-[#00988D] transition-colors duration-300">
              <History className="w-8 h-8 text-[#00988D] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#013750] mb-2">
              Histórico
            </h3>
            <p className="text-slate-500 text-sm">
              Navegue pelos meses anteriores.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[#00988D] font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Visualizar</span>
            <ArrowRight size={18} />
          </div>
        </Link>

        {/* CARD 3: Analytics */}
        <Link 
          href="/analytics"
          className="group relative bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-[#bfdbfe] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#eef2ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#013750]/10 flex items-center justify-center mb-6 group-hover:bg-[#013750] transition-colors duration-300">
              <BarChart3 className="w-8 h-8 text-[#013750] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#013750] mb-2">
              Analytics
            </h3>
            <p className="text-slate-500 text-sm">
              Gráficos e insights da sua evolução.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[#013750] font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Explorar</span>
            <ArrowRight size={18} />
          </div>
        </Link>

      </div>

      <footer className="mt-16 text-center text-slate-400 text-sm">
        <p>Seneb Financial Control &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}