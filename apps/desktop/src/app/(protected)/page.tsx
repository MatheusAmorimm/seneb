"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, History, BarChart3, ArrowRight } from "lucide-react";
import { Navbar } from "../../components/navbar";
import { getStorageItem, setStorageItem } from "../../lib/storage"; 
import { UserData } from "../../types/index";
import api from "../../services/api"; // Instância do Axios [cite: 858]

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Investidor");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      // 1. TENTA CARREGAR RÁPIDO DO STORAGE (UX imediata)
      try {
        const savedUser = await getStorageItem<UserData | string>("user");
        if (savedUser) {
          const parsed = typeof savedUser === "string" ? JSON.parse(savedUser) : savedUser;
          const initialName = parsed.nickname || parsed.full_name?.split(" ")[0] || "Investidor";
          setUserName(initialName);
        }
      } catch (e) {
        console.warn("Storage local vazio ou corrompido");
      }

      // 2. BUSCA DO BANCO DE DADOS (Verdade absoluta)
      try {
        // O interceptor já injeta o Token automaticamente [cite: 859]
        const response = await api.get("/users/me");
        const freshData = response.data;

        const freshDisplayName = freshData.nickname || freshData.full_name?.split(" ")[0] || "Investidor";
        
        // Atualiza o estado na tela
        setUserName(freshDisplayName);
        
        // Sincroniza o storage para a próxima vez [cite: 855, 856]
        await setStorageItem("user", freshData);
      } catch (error) {
        console.error("Não foi possível sincronizar perfil com o servidor:", error);
        // Se der 401, o interceptor em api.ts fará o logout automático [cite: 860]
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#F8FAFC]">
      <Navbar />
      
      <div className="text-center space-y-4 mb-16 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-deepBlue">
          Olá, <span className="text-brand-turquoise">{userName}!</span>
        </h1>
        <p className="text-lg text-slate-600 font-sans">
          {isLoading ? "Sincronizando seus dados..." : "Bem-vindo de volta ao seu controle financeiro."} <br />
          Por onde deseja começar hoje?
        </p>
      </div>

      {/* Grid de Navegação - Mantido Conforme o Original */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* ... Seus cards de Lançamentos, Histórico e Analytics ... */}
        <div 
          onClick={() => router.push("/lancamentos")}
          className="cursor-pointer group relative bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-expense-start shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#fff0e6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6 group-hover:bg-brand-orange transition-colors duration-300">
              <PlusCircle className="w-8 h-8 text-brand-orange group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-deepBlue mb-2">Lançamentos</h3>
            <p className="text-slate-500 text-sm">Adicione receitas e despesas do mês atual.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-brand-orange font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Acessar</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* ... Card Histórico ... */}
        <div 
          onClick={() => router.push("/historico")}
          className="cursor-pointer group relative bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-[#cceae8] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-[#e0f7fa] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-turquoise/10 flex items-center justify-center mb-6 group-hover:bg-brand-turquoise transition-colors duration-300">
              <History className="w-8 h-8 text-brand-turquoise group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-deepBlue mb-2">Histórico</h3>
            <p className="text-slate-500 text-sm">Navegue pelos meses anteriores.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-brand-turquoise font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Visualizar</span>
            <ArrowRight size={18} />
          </div>
        </div>

        {/* ... Card Analytics ... */}
        <div 
          onClick={() => router.push("/analytics")}
          className="cursor-pointer group relative bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-[#bfdbfe] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden"
        >
           
           <div className="absolute inset-0 bg-gradient-to-br from-[#eef2ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-deepBlue/10 flex items-center justify-center mb-6 group-hover:bg-brand-deepBlue transition-colors duration-300">
              <BarChart3 className="w-8 h-8 text-brand-deepBlue group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-deepBlue mb-2">Analytics</h3>
            <p className="text-slate-500 text-sm">Gráficos e insights da sua evolução.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-brand-deepBlue font-medium mt-4 group-hover:gap-4 transition-all">
            <span>Explorar</span>
            <ArrowRight size={18} />
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-slate-400 text-sm">
        <p>Seneb Financial Control &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}