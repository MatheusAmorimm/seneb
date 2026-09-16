'use client';

import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fffe] to-[#eef6f5] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#013750] to-[#2C6B74] shadow-xl mb-8">
          <SearchX size={48} className="text-white" />
        </div>

        {/* 404 Number */}
        <h1 className="text-8xl font-serif font-bold text-[#013750] tracking-tight mb-2">
          4<span className="text-[#00988D]">0</span>4
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-serif font-bold text-[#013750] mb-3">
          Página não encontrada
        </h2>
        <p className="text-slate-500 text-lg leading-relaxed mb-10">
          A página que você está procurando não existe ou foi movida. Verifique o endereço ou volte para o início.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#013750] text-white font-bold rounded-xl shadow-lg hover:bg-[#024a6a] transition-all hover:shadow-xl active:scale-95 no-underline"
          >
            <Home size={20} />
            Voltar ao Início
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-16 text-slate-400 text-sm">
          © {new Date().getFullYear()} Seneb. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
