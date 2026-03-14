"use client";

import { AxiosError } from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { DollarSign, Check, Eye, EyeOff } from 'lucide-react'; // Mantive apenas o que você já tinha
import { useRouter } from 'next/navigation';
import api from '../../../services/api'; // Certifique-se que o caminho está certo
import { setStorageItem, removeFromDiskOnly } from '@/src/lib/storage';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [keepLogged, setKeepLogged] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // DEBUG: Verifique no console (F12) se estes valores aparecem quando você clica em entrar
    console.log("Tentando Login com:", { email, password });

    try {
      // 1. FORÇA BRUTA: Criamos os dados no formato exato de formulário
      const params = new URLSearchParams();
      params.append('username', email); // FastAPI exige 'username', não 'email'
      params.append('password', password);

      // 2. ENVIO EXPLÍCITO: Forçamos o header para 'application/x-www-form-urlencoded'
      // Isso impede que o Axios tente enviar como JSON acidentalmente
      const response = await api.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      // 3. SE SUCESSO:
      const token = response.data.access_token;
      // Pega o apelido, ou primeiro nome, ou fallback
      const userName = response.data.nickname || response.data.user_name?.split(' ')[0] || "Usuário";

      // 4. LÓGICA DE PERSISTÊNCIA (Como combinamos)
      if (keepLogged) {
        // Checkbox MARCADO -> Disco
        await setStorageItem('token', token);
        await setStorageItem('user', userName);
        await setStorageItem('remember_me', true);
      } else {
        // Checkbox DESMARCADO -> RAM
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(userName));
        
        // CORREÇÃO CRÍTICA:
        // Usamos a função nova para limpar SÓ O DISCO.
        // Assim, a RAM (onde acabamos de salvar o token) continua intacta.
        await removeFromDiskOnly('token');
        await removeFromDiskOnly('user');
        await removeFromDiskOnly('remember_me');
      }

      toast.success(`Bem-vindo(a), ${userName}!`);
      router.push('/');

    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Erro Completo Backend:", error.response?.data);
        
        const detail = error.response?.data?.detail;
        
        // Tratamento específico para erros de validação (Array)
        if (Array.isArray(detail)) {
             // Geralmente o erro é: [{loc: ['body', 'username'], msg: 'field required', ...}]
             const field = detail[0]?.loc[1] === 'username' ? 'E-mail' : 'Senha';
             toast.error(`O campo ${field} é obrigatório.`);
        } else if (typeof detail === 'string') {
             toast.error(detail); // Ex: "E-mail ou senha incorretos"
        } else {
             toast.error("Verifique seus dados e tente novamente.");
        }
      } else {
        toast.error("Erro inesperado. Verifique sua conexão.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 transition-colors" style={{ background: 'linear-gradient(135deg, #013750 0%, #2C6B74 50%, #00988D 100%)' }}>
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-[#012a3d] rounded-2xl shadow-2xl overflow-hidden transition-colors border border-transparent dark:border-slate-800">
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
                <label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors">
                  E-MAIL <span className="text-red-500">*</span>
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
                    className="w-full pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 transition-all dark:bg-slate-900 dark:text-white"
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
                  <label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors">
                    SENHA <span className="text-red-500">*</span>
                  </label>
                </div>
                
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 pr-12 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-700 dark:text-white dark:bg-slate-900"
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#00988D] hover:bg-[#007A71] text-white transition-all cursor-pointer z-10 shadow-sm active:scale-95"
                    title={showPassword ? "Esconder senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  style={{ WebkitAppRegion: 'no-drag', cursor: 'pointer' } as React.CSSProperties} // IMPORTANTE: Impede que o botão envie o formulário
                  onClick={(e) => {
                    e.stopPropagation(); // Garante que o clique não suba para o form
                    setKeepLogged(prev => !prev); // Usa callback para garantir estado atual
                  }}
                  className="relative z-50 flex items-center gap-2 group focus:outline-none">
                
                    <div className={`
                      w-5 h-5 rounded border flex items-center justify-center transition-all duration-200
                      ${keepLogged 
                      ? 'border-brand-turquoise' // Estado ATIVO (Fundo verde, Borda verde)
                      : 'bg-white border-slate-300 group-hover:border-brand-turquoise' // Estado INATIVO (Fundo branco + Hover na borda)
                      }`
                    }
                    style={{
                      backgroundColor: keepLogged ? '#00988D' : 'white',
                    }}>
                      <Check 
                      size={14} 
                      className={`text-white transition-transform duration-200 ${keepLogged ? 'scale-100' : 'scale-0'}`} 
                      strokeWidth={3}
                      />
                    </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium group-hover:text-brand-turquoise transition-colors select-none pointer-events-none">
                    Manter-me conectado
                  </span>
                </button>
                  <button type="button" onClick={() => router.push('/recuperar-senha')} className="text-xs text-brand-orange hover:underline cursor-pointer">
                    <strong>Esqueceu a senha?</strong>
                  </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-bold shadow-md cursor-pointer 
                bg-brand-orange hover:bg-[#d63802] 
                transition-transform duration-200 hover:scale-[1.05] disabled:opacity-70"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300 dark:border-slate-800"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-[#012a3d] text-slate-500 transition-colors">Ou</span></div>
              </div>

              <div className="text-center">
                <span className="text-slate-600 dark:text-slate-400">Não tem uma conta? </span>
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