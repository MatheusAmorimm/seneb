"use client";

import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, Crown, ShieldAlert, X, ArrowRight, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import api from "../../../../services/api";
import { setStorageItem } from "../../../../lib/storage";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  // --- Modal States ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // --- Change Password States ---
  const [pwStep, setPwStep] = useState(1);
  const [pwLoading, setPwLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [pwCode, setPwCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- Change Email States ---
  const [emStep, setEmStep] = useState(1);
  const [emLoading, setEmLoading] = useState(false);
  const [emCurrentPassword, setEmCurrentPassword] = useState("");
  const [emCode, setEmCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emNewCode, setEmNewCode] = useState("");

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.patch("/users/me", {
        full_name: fullName,
        nickname: nickname
      });
      
      const updatedUser = response.data;
      await setStorageItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const detail = error.response?.data?.detail;
      return typeof detail === "string" ? detail : "Erro na operação.";
    }
    return "Erro de conexão com o servidor.";
  };

  // ===========================================
  // CHANGE PASSWORD HANDLERS
  // ===========================================

  const resetPasswordModal = () => {
    setPwStep(1);
    setCurrentPassword("");
    setPwCode("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(false);
  };

  const handlePwInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    try {
      await api.post("/users/change-password/init", { current_password: currentPassword });
      toast.success("Código enviado para seu e-mail!");
      setPwStep(2);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPwLoading(false);
    }
  };

  const handlePwVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwCode.length < 8) {
      toast.warning("Digite o código de 8 dígitos.");
      return;
    }
    setPwStep(3);
  };

  const handlePwConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Senhas não coincidem.");
      return;
    }
    setPwLoading(true);
    try {
      await api.post("/users/change-password/confirm", {
        code: pwCode,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success("Senha alterada com sucesso!");
      resetPasswordModal();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPwLoading(false);
    }
  };

  // ===========================================
  // CHANGE EMAIL HANDLERS
  // ===========================================

  const resetEmailModal = () => {
    setEmStep(1);
    setEmCurrentPassword("");
    setEmCode("");
    setNewEmail("");
    setEmNewCode("");
    setShowEmailModal(false);
  };

  const handleEmInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmLoading(true);
    try {
      await api.post("/users/change-email/init", { current_password: emCurrentPassword });
      toast.success("Código enviado para seu e-mail atual!");
      setEmStep(2);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEmLoading(false);
    }
  };

  const handleEmVerifyCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emCode.length < 8) {
      toast.warning("Digite o código de 8 dígitos.");
      return;
    }
    setEmLoading(true);
    try {
      await api.post("/users/change-email/verify-current", { code: emCode });
      toast.success("Código verificado!");
      setEmStep(3);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEmLoading(false);
    }
  };

  const handleEmSetNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      toast.warning("Digite o novo e-mail.");
      return;
    }
    setEmLoading(true);
    try {
      await api.post("/users/change-email/set-new", { new_email: newEmail, code: "" });
      toast.success(`Código enviado para ${newEmail}!`);
      setEmStep(4);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEmLoading(false);
    }
  };

  const handleEmConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emNewCode.length < 8) {
      toast.warning("Digite o código de 8 dígitos.");
      return;
    }
    setEmLoading(true);
    try {
      const response = await api.post("/users/change-email/confirm", { code: emNewCode });
      setEmail(response.data.new_email);
      toast.success("E-mail alterado com sucesso!");
      resetEmailModal();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEmLoading(false);
    }
  };

  // ===========================================
  // RENDER
  // ===========================================

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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
                  <button type="button" onClick={() => setShowEmailModal(true)} className="px-4 text-sm font-bold text-[#00988D] hover:bg-teal-50 rounded-xl transition-colors cursor-pointer">Alterar</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5 ml-1">Senha</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" value="********" readOnly className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                  </div>
                  <button type="button" onClick={() => setShowPasswordModal(true)} className="px-4 text-sm font-bold text-[#00988D] hover:bg-teal-50 rounded-xl transition-colors cursor-pointer">Redefinir</button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 ml-1">* Alterações de e-mail e senha exigem confirmação via código enviado ao seu e-mail atual.</p>
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

      {/* ============================================ */}
      {/* MODAL: ALTERAR SENHA                        */}
      {/* ============================================ */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#013750] to-[#2C6B74] p-6 flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <KeyRound className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-serif font-bold text-white">Alterar Senha</h3>
                <p className="text-white/70 text-sm">
                  {pwStep === 1 && "Confirme sua senha atual"}
                  {pwStep === 2 && "Digite o código enviado por e-mail"}
                  {pwStep === 3 && "Crie sua nova senha"}
                </p>
              </div>
              <button onClick={resetPasswordModal} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="flex gap-1 px-6 pt-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= pwStep ? 'bg-[#00988D]' : 'bg-slate-200'}`} />
              ))}
            </div>

            <div className="p-6">
              {/* Step 1: Current Password */}
              {pwStep === 1 && (
                <form onSubmit={handlePwInit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5">Senha Atual</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all"
                      placeholder="Digite sua senha atual" autoFocus required />
                  </div>
                  <button type="submit" disabled={pwLoading}
                    className="w-full py-3 bg-[#00988D] text-white font-bold rounded-xl hover:bg-[#007f76] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                    {pwLoading ? "Verificando..." : <><ArrowRight size={18} /> Continuar</>}
                  </button>
                </form>
              )}

              {/* Step 2: Code */}
              {pwStep === 2 && (
                <form onSubmit={handlePwVerifyCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5">Código de verificação</label>
                    <input type="text" maxLength={8} value={pwCode} onChange={e => setPwCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-2xl font-bold tracking-widest p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all"
                      placeholder="0000-0000" autoFocus />
                  </div>
                  <button type="submit" disabled={pwCode.length < 8}
                    className="w-full py-3 bg-[#00988D] text-white font-bold rounded-xl hover:bg-[#007f76] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                    <ArrowRight size={18} /> Continuar
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {pwStep === 3 && (
                <form onSubmit={handlePwConfirm} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5">Nova Senha</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all"
                      placeholder="Mínimo 8 caracteres" autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5">Confirmar Nova Senha</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all"
                      placeholder="Digite novamente" />
                  </div>
                  <button type="submit" disabled={pwLoading}
                    className="w-full py-3 bg-[#F23E02] text-white font-bold rounded-xl hover:bg-[#d93602] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                    {pwLoading ? "Alterando..." : <><Save size={18} /> Alterar Senha</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL: ALTERAR EMAIL                        */}
      {/* ============================================ */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#013750] to-[#2C6B74] p-6 flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <Mail className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-serif font-bold text-white">Alterar E-mail</h3>
                <p className="text-white/70 text-sm">
                  {emStep === 1 && "Confirme sua senha"}
                  {emStep === 2 && "Código enviado para seu e-mail atual"}
                  {emStep === 3 && "Digite seu novo e-mail"}
                  {emStep === 4 && "Confirme o código no novo e-mail"}
                </p>
              </div>
              <button onClick={resetEmailModal} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="flex gap-1 px-6 pt-4">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= emStep ? 'bg-[#00988D]' : 'bg-slate-200'}`} />
              ))}
            </div>

            <div className="p-6">
              {/* Step 1: Current Password */}
              {emStep === 1 && (
                <form onSubmit={handleEmInit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5">Senha Atual</label>
                    <input type="password" value={emCurrentPassword} onChange={e => setEmCurrentPassword(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all"
                      placeholder="Digite sua senha atual" autoFocus required />
                  </div>
                  <button type="submit" disabled={emLoading}
                    className="w-full py-3 bg-[#00988D] text-white font-bold rounded-xl hover:bg-[#007f76] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                    {emLoading ? "Verificando..." : <><ArrowRight size={18} /> Continuar</>}
                  </button>
                </form>
              )}

              {/* Step 2: Verify code from current email */}
              {emStep === 2 && (
                <form onSubmit={handleEmVerifyCurrent} className="space-y-4">
                  <p className="text-sm text-slate-500">Enviamos um código de 8 dígitos para <strong>{email}</strong>.</p>
                  <div>
                    <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5">Código</label>
                    <input type="text" maxLength={8} value={emCode} onChange={e => setEmCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-2xl font-bold tracking-widest p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all"
                      placeholder="0000-0000" autoFocus />
                  </div>
                  <button type="submit" disabled={emLoading || emCode.length < 8}
                    className="w-full py-3 bg-[#00988D] text-white font-bold rounded-xl hover:bg-[#007f76] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                    {emLoading ? "Validando..." : <><ArrowRight size={18} /> Continuar</>}
                  </button>
                </form>
              )}

              {/* Step 3: Enter new email */}
              {emStep === 3 && (
                <form onSubmit={handleEmSetNew} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5">Novo E-mail</label>
                    <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all"
                      placeholder="novo@email.com" autoFocus required />
                  </div>
                  <button type="submit" disabled={emLoading}
                    className="w-full py-3 bg-[#00988D] text-white font-bold rounded-xl hover:bg-[#007f76] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                    {emLoading ? "Enviando código..." : <><ArrowRight size={18} /> Enviar código para o novo e-mail</>}
                  </button>
                </form>
              )}

              {/* Step 4: Verify code from new email */}
              {emStep === 4 && (
                <form onSubmit={handleEmConfirm} className="space-y-4">
                  <p className="text-sm text-slate-500">Enviamos um código para <strong>{newEmail}</strong>.</p>
                  <div>
                    <label className="block text-xs font-bold text-[#2C6B74] uppercase mb-1.5">Código do novo e-mail</label>
                    <input type="text" maxLength={8} value={emNewCode} onChange={e => setEmNewCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-2xl font-bold tracking-widest p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#00988D] transition-all"
                      placeholder="0000-0000" autoFocus />
                  </div>
                  <button type="submit" disabled={emLoading || emNewCode.length < 8}
                    className="w-full py-3 bg-[#F23E02] text-white font-bold rounded-xl hover:bg-[#d93602] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                    {emLoading ? "Confirmando..." : <><Save size={18} /> Confirmar alteração</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}