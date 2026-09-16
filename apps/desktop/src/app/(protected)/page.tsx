"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, History, BarChart3, ArrowRight, Users, Shield, Zap, RefreshCw, Globe, Tag, Target } from "lucide-react";
import { SenebLogo } from "../../components/seneb_logo";
import { Header } from "../../components/header";
import { Sidebar } from "../../components/sidebar";
import { getStorageItem, setStorageItem } from "../../lib/storage";
import { UserData } from "../../types/index";
import { useTheme } from "../../components/theme_provider";
import api from "../../services/api";

const APP_VERSION_FALLBACK = "0.5.0";

async function getTauriVersion(): Promise<string> {
  try {
    if (typeof window !== "undefined" && (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
      const { getVersion } = await import("@tauri-apps/api/app");
      return await getVersion();
    }
  } catch {
    // fall through to fallback
  }
  return APP_VERSION_FALLBACK;
}

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Investidor");
  const [isLoading, setIsLoading] = useState(true);
  const [appVersion, setAppVersion] = useState(APP_VERSION_FALLBACK);
  const { isSidebarOpen, setIsSidebarOpen, setIsHome } = useTheme();

  useEffect(() => {
    setIsHome(false);
  }, [setIsHome]);

  useEffect(() => {
    getTauriVersion().then(setAppVersion);
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const savedUser = await getStorageItem<UserData | string>("user");
        if (savedUser) {
          const parsed = typeof savedUser === "string" ? JSON.parse(savedUser) : savedUser;
          const initialName = parsed.nickname || parsed.full_name?.split(" ")[0] || "Investidor";
          setUserName(initialName);
        }
      } catch {
        // storage vazio, seguir com fallback
      }

      try {
        const response = await api.get("/users/me");
        const freshData = response.data;
        const freshDisplayName = freshData.nickname || freshData.full_name?.split(" ")[0] || "Investidor";
        setUserName(freshDisplayName);
        await setStorageItem("user", freshData);
      } catch {
        // 401 é tratado pelo interceptor em api.ts
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col items-center justify-center p-8">

      {/* Saudação */}
      <div className="text-center space-y-4 mb-16 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-deepBlue dark:text-slate-100 transition-colors">
          Olá, <span className="text-brand-turquoise">{userName}!</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-sans transition-colors">
          {isLoading ? "Sincronizando seus dados..." : "Bem-vindo de volta ao seu controle financeiro."}{" "}
          <br />
          Por onde deseja começar hoje?
        </p>
      </div>

      {/* Cards de Navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-6xl">
        <div
          onClick={() => router.push("/lancamentos")}
          className="cursor-pointer group relative bg-white/60 dark:bg-[#012a3d]/60 backdrop-blur-md p-8 rounded-3xl border border-expense-start dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#fff0e6] dark:from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6 group-hover:bg-brand-orange transition-colors duration-300">
              <PlusCircle className="w-8 h-8 text-brand-orange group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-deepBlue dark:text-slate-100 mb-2">Lançamentos</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Adicione receitas e despesas do mês atual.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-brand-orange font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Acessar</span>
            <ArrowRight size={18} />
          </div>
        </div>

        <div
          onClick={() => router.push("/historico")}
          className="cursor-pointer group relative bg-white/60 dark:bg-[#012a3d]/60 backdrop-blur-md p-8 rounded-3xl border border-[#cceae8] dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#e0f7fa] dark:from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-turquoise/10 flex items-center justify-center mb-6 group-hover:bg-brand-turquoise transition-colors duration-300">
              <History className="w-8 h-8 text-brand-turquoise group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-deepBlue dark:text-slate-100 mb-2">Histórico</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Navegue pelos meses anteriores.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-brand-turquoise font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Visualizar</span>
            <ArrowRight size={18} />
          </div>
        </div>

        <div
          onClick={() => router.push("/analytics")}
          className="cursor-pointer group relative bg-white/60 dark:bg-[#012a3d]/60 backdrop-blur-md p-8 rounded-3xl border border-[#bfdbfe] dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#eef2ff] dark:from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-deepBlue/10 flex items-center justify-center mb-6 group-hover:bg-brand-deepBlue transition-colors duration-300">
              <BarChart3 className="w-8 h-8 text-brand-deepBlue group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-deepBlue dark:text-slate-100 mb-2">Analytics</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gráficos e insights da sua evolução.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-brand-deepBlue dark:text-brand-deepBlue font-medium mt-4 group-hover:gap-4 transition-all">
            <span className="dark:text-slate-300">Explorar</span>
            <ArrowRight size={18} className="dark:text-slate-300" />
          </div>
        </div>

        <div
          onClick={() => router.push("/metas")}
          className="cursor-pointer group relative bg-white/60 dark:bg-[#012a3d]/60 backdrop-blur-md p-8 rounded-3xl border border-amber-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#fef9c3] dark:from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
              <Target className="w-8 h-8 text-amber-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-deepBlue dark:text-slate-100 mb-2">Metas</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Acompanhe e celebre suas metas.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Acessar</span>
            <ArrowRight size={18} />
          </div>
        </div>

        <div
          onClick={() => router.push("/grupos")}
          className="cursor-pointer group relative bg-white/60 dark:bg-[#012a3d]/60 backdrop-blur-md p-8 rounded-3xl border border-indigo-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#eef2ff] dark:from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-colors duration-300">
              <Users className="w-8 h-8 text-indigo-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-deepBlue dark:text-slate-100 mb-2">Meus Grupos</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Controle finanças em conjunto com convidados.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-indigo-500 font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Gerenciar</span>
            <ArrowRight size={18} />
          </div>
        </div>
      </div>

      {/* Sobre */}
      <div className="w-full max-w-6xl mt-16">
        <div className="bg-white/50 dark:bg-[#012a3d]/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">

          {/* Cabeçalho do About */}
          <div className="px-8 pt-8 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-1">
              <SenebLogo className="text-brand-deepBlue dark:text-slate-100" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Controle Financeiro Pessoal</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-turquoise/10 text-brand-turquoise text-sm font-medium border border-brand-turquoise/20 self-start sm:self-auto">
              <Tag size={13} />
              v{appVersion}
            </span>
          </div>

          {/* Chips de info */}
          <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-9 h-9 rounded-xl bg-brand-turquoise/10 flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={16} className="text-brand-turquoise" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Plataforma</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Aplicativo Desktop</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw size={16} className="text-brand-orange" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Atualizações</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Automáticas</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Verificadas ao iniciar o app</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Shield size={16} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Segurança</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dados criptografados</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Armazenamento seguro em nuvem</p>
              </div>
            </div>
          </div>

          {/* Rodapé do About */}
          <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
              <a
                href="https://seneb.com.br/privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-turquoise transition-colors flex items-center gap-1"
              >
                <Globe size={11} />
                Política de Privacidade
              </a>
              <span>·</span>
              <a
                href="https://seneb.com.br/termos"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-turquoise transition-colors"
              >
                Termos de Uso
              </a>
              <span>·</span>
              <a
                href="https://seneb.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-turquoise transition-colors"
              >
                seneb.com.br
              </a>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} Seneb Financial. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      </main>
    </div>
  );
}
