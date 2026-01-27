"use client";

import { AxiosError } from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { DollarSign } from 'lucide-react'; // Mantive apenas o que você já tinha
import { useRouter } from 'next/navigation';
import api from '../../services/api'; // Certifique-se que o caminho está certo

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // ALTERAÇÃO AQUI: 
      // Chamamos apenas '/login'. A base URL (api/v1) vem do arquivo api.ts (que lê o .env)
      const response = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log("LOGIN SUCESSO:", response.data);

      localStorage.setItem('token', response.data.access_token);
      
      // Verifica se o backend retorna user_name e salva
      if (response.data.user_name) {
         localStorage.setItem('user', JSON.stringify(response.data.user_name));
      }

      router.push('/'); 

    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || "Erro ao conectar com o servidor.";
        console.error("Erro no Login:", error.response?.data);
        alert(errorMessage);
      } else {
        console.error("Erro desconhecido:", error);
        alert("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #013750 0%, #2C6B74 50%, #00988D 100%)' }}>
      <div className="max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center" style={{ background: 'linear-gradient(to right, #013750, #2C6B74)' }}>
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                <DollarSign className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-white text-3xl mb-2">Bem-vindo de volta!</h1>
            <p className="text-white">Faça login para acessar seu controle financeiro</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="text-slate-700 font-medium text-sm">
                  E-MAIL
                </label>
                <div className="relative">
                  {/* ÍCONE COM POSICIONAMENTO ABSOLUTO (Mantido vazio conforme pedido) */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      borderColor: '#e2e8f0',
                      paddingLeft: '20px' 
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00988D';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 152, 141, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="text-slate-700 font-medium text-sm">
                    SENHA
                  </label>
                </div>
                
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-700"
                    style={{ borderColor: '#e2e8f0' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00988D';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 152, 141, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="button" 
                className="text-xs text-[#F23E02] hover:underline cursor-pointer"
              >
                <strong>Esqueceu a senha?</strong>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-bold shadow-md cursor-pointer 
                bg-[#F23E02] hover:bg-[#d63802] 
                transition-transform duration-200 hover:scale-[1.05] disabled:opacity-70"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-500">Ou</span></div>
              </div>

              <button type="button" className="w-full py-3 px-4 rounded-lg border-2 border-slate-300 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 flex items-center justify-center gap-3 shadow-sm cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Continuar com Google
              </button>

              <div className="text-center">
                <span className="text-slate-600">Não tem uma conta? </span>
                <Link href="/cadastro" className="transition-colors" style={{ color: '#F23E02' }}><strong>Criar conta</strong></Link>
              </div>
            </form>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-white text-sm">© {new Date().getFullYear()} Controle Financeiro Pessoal.</p>
        </div>
      </div>
    </div>
  );
}