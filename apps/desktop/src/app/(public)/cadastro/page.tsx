"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AxiosError } from 'axios';
import api from '../../../services/api';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { setStorageItem } from '@/src/lib/storage';
import { open } from '@tauri-apps/plugin-shell';

import { useRouter } from 'next/navigation';

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Controle de Etapas: 1 = Cadastro, 2 = Código
  const [step, setStep] = useState(1);

  // inputCode é o que o usuário digita na tela 2
  const [inputCode, setInputCode] = useState('');

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- PASSO 1: PEDIR AO BACKEND PARA ENVIAR O EMAIL ---
  const handlePreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !password || !confirmPassword) {
      toast.warning("Preencha todos os campos obrigatórios.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, digite um e-mail válido.");
      return;
    }

    // 🚀 NOVA VALIDAÇÃO DE SENHA FORTE NO FRONTEND
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("A senha deve ter 8+ caracteres, 1 maiúscula, 1 minúscula e 1 caractere especial.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      // 2. CHAMA O BACKEND REAL
      // Essa rota vai salvar o código no Mongo e enviar o E-mail
      await api.post('auth/send-code', { email });

      setLoading(false);
      setStep(2); // Muda para tela de código

      toast.success(`Código enviado para ${email}`);
      toast.info("Verifique sua caixa de entrada (e spam).");

    } catch (error) {
      setLoading(false);
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.detail || "Erro ao enviar e-mail.";
        toast.error(typeof msg === 'string' ? msg : "Falha no envio.");
      } else {
        toast.error("Erro de conexão com o servidor.");
      }
    }
  };

  // --- PASSO 2: ENVIAR CÓDIGO E DADOS PARA CADASTRO ---
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputCode.length < 8) {
      toast.warning("Digite o código de 8 dígitos.");
      return;
    }

    setLoading(true);

    try {
      // Monta o objeto final para o Backend
      // Note que agora enviamos o 'verification_code' junto!
      const payload = {
        full_name: nome,
        email: email,
        password: password,
        confirm_password: confirmPassword,
        nickname: nickname || nome.split(' ')[0],
        verification_code: inputCode // <--- O Backend vai validar isso no Mongo
      };

      const response = await api.post('auth/signup', payload);

      await setStorageItem('token', response.data.access_token);
      await setStorageItem('user', response.data.user_name);
      await setStorageItem('remember_me', true);

      toast.success("Conta criada com sucesso! Redirecionando...");

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (error) {
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.detail || "Erro ao criar conta.";
        // Mensagens comuns: "Código inválido", "Email já cadastrado"
        toast.error(typeof msg === 'string' ? msg : "Erro nos dados enviados.");
      } else {
        toast.error("Erro desconhecido ao conectar com o servidor.");
      }
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-white text-3xl mb-2">{step === 1 ? "Crie sua conta" : "Verifique seu e-mail"}</h1>
            <p className="text-white">
              {step === 1 ? "Comece a controlar suas finanças hoje mesmo" : `Digite o código enviado para ${email}`}
            </p>
          </div>

          <div className="p-8">

            {/* --- ETAPA 1: DADOS --- */}
            {step === 1 && (
              <form onSubmit={handlePreSubmit} className="space-y-6">

                {/* Nome */}
                <div>
                  <label className="block mb-2 text-slate-700 font-medium text-sm">NOME COMPLETO <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-turquoise focus:ring-brand-turquoise transition-all"
                      style={{ paddingLeft: '20px' }}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>

                {/* Apelido */}
                <div>
                  <label className="block mb-2 text-slate-700 font-medium text-sm">APELIDO (Opcional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-turquoise focus:ring-brand-turquoise transition-all"
                      style={{ paddingLeft: '20px' }}
                      placeholder="Seu apelido"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 text-slate-700 font-medium text-sm">E-MAIL <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-turquoise focus:ring-brand-turquoise transition-all"
                      style={{ paddingLeft: '20px' }}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block mb-2 text-slate-700 font-medium text-sm">SENHA <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-turquoise focus:ring-brand-turquoise transition-all"
                      style={{ paddingLeft: '20px' }}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block mb-2 text-slate-700 font-medium text-sm">CONFIRMAR SENHA <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-turquoise focus:ring-brand-turquoise transition-all"
                      style={{ paddingLeft: '20px' }}
                      placeholder="Digite a senha novamente"
                    />
                  </div>
                </div>

                {/* Termos */}
                <div className="flex items-start pt-2 gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-slate-600">
                    Eu concordo com os{' '}
                    <button
                      type="button"
                      onClick={() => open('https://seneb.com.br/termos')}
                      className="transition-all cursor-pointer font-bold hover:underline"
                      style={{ color: '#00988D' }}
                    >
                      Termos de Uso
                    </button>
                    {' '}e{' '}
                    <button
                      type="button"
                      onClick={() => open('https://seneb.com.br/privacidade')}
                      className="transition-all cursor-pointer font-bold hover:underline"
                      style={{ color: '#00988D' }}
                    >
                      Política de Privacidade
                    </button>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-70"
                  style={{ backgroundColor: '#F23E02' }}
                >
                  {loading ? 'Enviando Código...' : 'Continuar'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-500">Ou</span></div>
                </div>

                <div className="text-center">
                  <span className="text-slate-600">Já tem uma conta? </span>
                  <button type="button" onClick={() => router.push('/login/')} className="transition-colors font-bold hover:underline cursor-pointer" style={{ color: '#F23E02' }}>Fazer login</button>
                </div>
              </form>
            )}

            {/* --- ETAPA 2: CÓDIGO --- */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div className="text-center">
                  <p className="text-slate-600 mb-4">Insira o código de 8 dígitos enviado para <strong>{email}</strong>.</p>

                  <input
                    type="text"
                    maxLength={8}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))} // Só aceita números
                    className="w-full text-center text-3xl font-bold tracking-widest py-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                    placeholder="00000000"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || inputCode.length < 8}
                  className="w-full py-3 rounded-lg text-white font-bold transition-transform hover:scale-[1.02] shadow-lg disabled:opacity-70"
                  style={{ backgroundColor: '#00988D' }}
                >
                  {loading ? 'Validando...' : 'Confirmar e Criar'}
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

          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-white text-sm">© {new Date().getFullYear()} Seneb Controle Financeiro Pessoal. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}