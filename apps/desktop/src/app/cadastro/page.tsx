"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import api from '../../services/api'; 
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner'; 
import { setStorageItem } from '@/src/lib/storage';

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

    // 1. Validações Locais
    if (!nome || !email || !password || !confirmPassword) {
      toast.warning("Preencha todos os campos obrigatórios.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, digite um e-mail válido.");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
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
      await api.post('/send-code', { email });
      
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

    if (inputCode.length < 4) {
      toast.warning("Digite o código de 4 dígitos.");
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

      const response = await api.post('/signup', payload);

      toast.success("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => router.push('/login'), 2000);

      await setStorageItem('token', response.data.access_token);
      await setStorageItem('user', response.data.user_name);
      await setStorageItem('remember_me', true)

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
                  <label className="block mb-2 text-slate-700 font-medium text-sm">NOME COMPLETO</label>
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
                  <label className="block mb-2 text-slate-700 font-medium text-sm">E-MAIL</label>
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
                  <label className="block mb-2 text-slate-700 font-medium text-sm">SENHA</label>
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
                  <label className="block mb-2 text-slate-700 font-medium text-sm">CONFIRMAR SENHA</label>
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
                    <button type="button" className="transition-colors font-bold hover:underline" style={{ color: '#00988D' }}>Termos de Uso</button>
                    {' '}e{' '}
                    <button type="button" className="transition-colors font-bold hover:underline" style={{ color: '#00988D' }}>Política de Privacidade</button>
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
                
                <button type="button" className="w-full py-3 px-4 rounded-lg border-2 border-slate-300 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 flex items-center justify-center gap-3 shadow-sm cursor-pointer">
                   <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                   Cadastrar com Google
                </button>

                <div className="text-center">
                  <span className="text-slate-600">Já tem uma conta? </span>
                  <Link href="/login" className="transition-colors font-bold hover:underline" style={{ color: '#F23E02' }}>Fazer login</Link>
                </div>
              </form>
            )}

            {/* --- ETAPA 2: CÓDIGO --- */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div className="text-center">
                  <p className="text-slate-600 mb-4">Insira o código de 4 dígitos enviado para <strong>{email}</strong>.</p>
                  
                  <input
                    type="text"
                    maxLength={4}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))} // Só aceita números
                    className="w-full text-center text-3xl font-bold tracking-widest py-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                    placeholder="0000"
                    autoFocus
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || inputCode.length < 4}
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
          <p className="text-white text-sm">© {new Date().getFullYear()} Controle Financeiro Pessoal. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}