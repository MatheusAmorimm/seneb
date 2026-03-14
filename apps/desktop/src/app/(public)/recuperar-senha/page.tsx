"use client";

import { useState } from 'react';
import { AxiosError } from 'axios';
import api from '../../../services/api';
import { DollarSign, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function RecuperarSenhaPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- STEP 1: Enviar código de recuperação ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.warning("Digite seu e-mail.");
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      toast.success(`Código enviado para ${email}`);
      toast.info("Verifique sua caixa de entrada (e spam).");
    } catch (error) {
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.detail || "Erro ao enviar código.";
        toast.error(typeof msg === 'string' ? msg : "Falha no envio.");
      } else {
        toast.error("Erro de conexão com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: Validar código e ir para Step 3 ---
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputCode.length < 8) {
      toast.warning("Digite o código de 8 dígitos.");
      return;
    }

    setStep(3);
  };

  // --- STEP 3: Redefinir a senha ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("A senha deve ter 8+ caracteres, 1 maiúscula, 1 minúscula e 1 caractere especial.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        code: inputCode,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      toast.success("Senha redefinida com sucesso! Faça login.");

      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error) {
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.detail || "Erro ao redefinir senha.";
        toast.error(typeof msg === 'string' ? msg : "Erro nos dados enviados.");
      } else {
        toast.error("Erro desconhecido ao conectar com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<number, string> = {
    1: "Recuperar senha",
    2: "Verifique seu e-mail",
    3: "Nova senha",
  };

  const stepDescriptions: Record<number, string> = {
    1: "Digite seu e-mail para receber um código de recuperação",
    2: `Digite o código enviado para ${email}`,
    3: "Crie sua nova senha",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #013750 0%, #2C6B74 50%, #00988D 100%)' }}>

      <div className="w-112.5">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <div className="p-8 text-center" style={{ background: 'linear-gradient(to right, #013750, #2C6B74)' }}>
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                <DollarSign className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-white text-3xl mb-2">{stepTitles[step]}</h1>
            <p className="text-white">{stepDescriptions[step]}</p>
          </div>

          <div className="p-8">

            {/* --- STEP 1: EMAIL --- */}
            {step === 1 && (
              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label className="block mb-2 text-slate-700 font-medium text-sm">E-MAIL <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-turquoise focus:ring-brand-turquoise transition-all"
                    style={{ paddingLeft: '20px' }}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-white font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-70"
                  style={{ backgroundColor: '#F23E02' }}
                >
                  {loading ? 'Enviando...' : 'Enviar código'}
                </button>

                <div className="text-center">
                  <button type="button" onClick={() => window.location.href = '/login'} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                    <ArrowLeft size={14} /> Voltar para o login
                  </button>
                </div>
              </form>
            )}

            {/* --- STEP 2: CODE --- */}
            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="text-center">
                  <p className="text-slate-600 mb-4">Insira o código de 8 dígitos enviado para <strong>{email}</strong>.</p>

                  <input
                    type="text"
                    maxLength={8}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl font-bold tracking-widest py-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                    placeholder="00000000"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={inputCode.length < 8}
                  className="w-full py-3 rounded-lg text-white font-bold transition-transform hover:scale-[1.02] shadow-lg disabled:opacity-70"
                  style={{ backgroundColor: '#00988D' }}
                >
                  Continuar
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-slate-500 hover:text-slate-800 underline"
                  >
                    Voltar e corrigir e-mail
                  </button>
                </div>
              </form>
            )}

            {/* --- STEP 3: NEW PASSWORD --- */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block mb-2 text-slate-700 font-medium text-sm">NOVA SENHA <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-turquoise focus:ring-brand-turquoise transition-all"
                    style={{ paddingLeft: '20px' }}
                    placeholder="Mínimo 8 caracteres"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block mb-2 text-slate-700 font-medium text-sm">CONFIRMAR NOVA SENHA <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-turquoise focus:ring-brand-turquoise transition-all"
                    style={{ paddingLeft: '20px' }}
                    placeholder="Digite a senha novamente"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-white font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-70"
                  style={{ backgroundColor: '#00988D' }}
                >
                  {loading ? 'Redefinindo...' : 'Redefinir senha'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm text-slate-500 hover:text-slate-800 underline"
                  >
                    Voltar e corrigir código
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-white text-sm">© {new Date().getFullYear()} Controle Financeiro Pessoal. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
