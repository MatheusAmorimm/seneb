"use client";

import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, Crown, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import api from "../../../services/api";
import { setStorageItem } from "../../../lib/storage"; // <--- 1. Importe isso

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados do Formulário
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  // Carregar dados (Mantido igual)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me");
        const { full_name, nickname, email } = response.data;
        setFullName(full_name || "");
        setNickname(nickname || "");
        setEmail(email || "");
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
        toast.error("Erro ao carregar seus dados.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Atualizar Perfil Básico (ALTERADO)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Envia para o Backend
      const response = await api.patch("/users/me", {
        full_name: fullName,
        nickname: nickname
      });
      
      // 2. O Backend retorna o usuário atualizado. Vamos atualizar o cache local!
      const updatedUser = response.data;
      
      // Salva no storage (convertendo para string, igual no login)
      await setStorageItem("user", JSON.stringify(updatedUser));
      
      // 3. Dispara evento para forçar atualização de componentes que ouvem o storage (opcional, mas boa prática)
      window.dispatchEvent(new Event("storage"));

      toast.success("Perfil atualizado com sucesso!");
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  // ... (Resto do componente UI continua IGUAL) ...
  // Apenas copie o return do código anterior ou mantenha o que você já tem.
  // Vou colocar o return abreviado aqui para facilitar a cópia se precisar:
  
  const handleSecurityChange = () => {
    toast.info("A alteração de segurança será liberada na próxima atualização.");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Carregando perfil...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-[#013750]">Meu Perfil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* COLUNA 1: DADOS PESSOAIS */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-[#013750] mb-6 flex items-center gap-2">
              <User size={20} className="text-[#00988D]" /> 
              Informações Pessoais
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Nome Completo</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Apelido (Como quer ser chamado)</label>
                <input value={nickname} onChange={(e) => setNickname(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all" placeholder="Ex: Matheus" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={isSaving}
                className="bg-[#013750] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#024a6a] transition-colors flex items-center gap-2 disabled:opacity-70">
                {isSaving ? "Salvando..." : <><Save size={18} /> Salvar Alterações</>}
              </button>
            </div>
          </form>

          {/* Card Segurança */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 opacity-80">
            <h2 className="text-lg font-bold text-[#013750] mb-6 flex items-center gap-2">
              <ShieldAlert size={20} className="text-orange-500" /> Segurança
            </h2>
            <div className="space-y-5">
              <div className="relative">
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">E-mail</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={email} readOnly className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                  </div>
                  <button type="button" onClick={handleSecurityChange} className="px-4 text-sm font-bold text-[#00988D] hover:bg-teal-50 rounded-xl transition-colors">Alterar</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Senha</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" value="********" readOnly className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                  </div>
                  <button type="button" onClick={handleSecurityChange} className="px-4 text-sm font-bold text-[#00988D] hover:bg-teal-50 rounded-xl transition-colors">Redefinir</button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 ml-1">* Por segurança, alterações de e-mail e senha exigem confirmação via código enviado ao seu e-mail atual.</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 2: PLANO */}
        <div className="md:col-span-1">
          <div className="bg-gradient-to-br from-[#013750] to-[#022a3d] p-6 rounded-2xl shadow-xl text-white text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <Crown size={32} className="text-[#F2B705]" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Seja Premium</h3>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">Desbloqueie relatórios ilimitados, gráficos avançados e suporte prioritário.</p>
            <button disabled className="w-full py-3 bg-[#F2B705] text-[#013750] font-bold rounded-xl shadow-lg hover:bg-[#d9a404] transition-all active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed">Assinar Agora (Em breve)</button>
            <p className="text-[10px] text-white/40 mt-4 uppercase tracking-widest">Plano Atual: Gratuito</p>
          </div>
        </div>
      </div>
    </div>
  );
}