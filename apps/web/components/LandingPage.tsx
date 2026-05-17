"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Calendar,
  Download,
  CheckCircle,
  Sparkles,
  MonitorSmartphone,
  X,
  Monitor,
  Terminal,
  Package
} from 'lucide-react';

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // 🚀 DETECÇÃO DE DISPOSITIVO AO CARREGAR A PÁGINA (Com tipagem e fluxo corrigidos)
  useEffect(() => {
    const timer = setTimeout(() => {
      const customWindow = window as typeof window & { opera?: string };
      const userAgent = navigator.userAgent || navigator.vendor || customWindow.opera || "";

      if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
        setIsMobile(true);
      }

      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleCTAClick = () => {
    if (isMobile) {
      alert('O Seneb é um sistema robusto para Desktop. Acesse este site pelo seu computador (Windows ou Linux) para baixar o aplicativo!');
      return;
    }
    setIsDownloadModalOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #FEF5C8, #e8f0ef)' }}>
      {/* Header */}
      <header className="text-white shadow-lg sticky top-0 z-50" style={{ background: 'linear-gradient(to right, #013750, #2C6B74)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 152, 141, 0.3)' }}>
                <DollarSign className="w-8 h-8" />
              </div>
              <span className="text-2xl font-bold">Seneb.</span>
            </div>

            {/* Menu Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#download"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(0, 152, 141, 0.2)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 152, 141, 0.4)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 152, 141, 0.2)'}
              >
                <Download className="w-4 h-4" />
                Download
              </Link>
              <Link
                href="#sobre-dev"
                className="px-4 py-2 hover:text-white/80 transition-colors"
              >
                Sobre o Dev
              </Link>
              <Link
                href="#changelogs"
                className="px-4 py-2 hover:text-white/80 transition-colors"
              >
                Changelogs
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCTAClick}
                className="px-6 py-2 rounded-lg text-white transition-all shadow-lg transform hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: '#F23E02' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d63802'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F23E02'}
              >
                {isMounted && isMobile ? (
                  <><MonitorSmartphone className="w-4 h-4" /> Acesse pelo PC</>
                ) : (
                  <><Download className="w-4 h-4" /> Baixar Grátis</>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <nav className="md:hidden flex items-center gap-4 mt-4 flex-wrap">
            <Link href="#download" className="text-sm px-3 py-1 rounded-lg flex items-center" style={{ backgroundColor: 'rgba(0, 152, 141, 0.2)' }}>
              <Download className="w-4 h-4 inline mr-1 cursor-pointer" />
              Download
            </Link>
            <Link href="#sobre-dev" className="text-sm px-3 py-1">Sobre o Dev</Link>
            <Link href="#changelogs" className="text-sm px-3 py-1">Changelogs</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(242, 62, 2, 0.1)', color: '#F23E02' }}>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">100% Gratuito e Fácil de Usar</span>
                </div>

                <h1 className="text-5xl md:text-6xl mb-6 text-slate-800 font-bold leading-tight">
                  Controle suas finanças com{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10" style={{ color: '#F23E02' }}>simplicidade</span>
                  </span>
                </h1>

                <p className="text-xl text-slate-600 mb-8">
                  Gerencie suas receitas e despesas de forma intuitiva.
                  Interface limpa, recursos poderosos, resultados imediatos.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleCTAClick}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl text-white text-lg font-semibold transition-all shadow-xl transform hover:scale-105 cursor-pointer"
                    style={{ backgroundColor: '#F23E02' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d63802'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F23E02'}
                  >
                    {isMounted && isMobile ? "Acesse pelo Computador" : "Baixar Agora"}
                    {isMounted && isMobile ? <MonitorSmartphone className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#F23E02' }}>100%</div>
                    <div className="text-sm text-slate-600">Gratuito</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#00988D' }}>2min</div>
                    <div className="text-sm text-slate-600">Para começar</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1" style={{ color: '#2C6B74' }}>∞</div>
                    <div className="text-sm text-slate-600">Transações</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Mock Interface */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
                    <DollarSign className="w-6 h-6" style={{ color: '#00988D' }} />
                    <span className="text-slate-800 font-bold">Painel de Controle</span>
                  </div>

                  <div className="space-y-4">
                    {/* Mock Balance Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                        <div className="text-xs text-green-700 mb-1 font-semibold">Receitas</div>
                        <div className="text-lg text-green-800 font-bold">R$ 5.420</div>
                      </div>
                      <div className="p-4 rounded-xl border-2" style={{ backgroundColor: '#fff5f0', borderColor: '#ffd4ba' }}>
                        <div className="text-xs mb-1 font-semibold" style={{ color: '#d63802' }}>Despesas</div>
                        <div className="text-lg font-bold" style={{ color: '#F23E02' }}>R$ 2.180</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                        <div className="text-xs text-blue-700 mb-1 font-semibold">Saldo</div>
                        <div className="text-lg text-blue-800 font-bold">R$ 3.240</div>
                      </div>
                    </div>

                    {/* Mock Transaction */}
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-700">Salário</span>
                        <span className="text-sm text-green-600 font-bold">+ R$ 4.500</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Mercado</span>
                        <span className="text-sm text-red-600 font-bold">- R$ 320</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-xl animate-bounce" style={{ border: '3px solid #F23E02' }}>
                  <CheckCircle className="w-8 h-8" style={{ color: '#F23E02' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-slate-800">Por que escolher o Seneb?</h2>
              <p className="text-xl text-slate-600">Simplicidade e poder em um único lugar</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(242, 62, 2, 0.1)' }}>
                  <TrendingUp className="w-7 h-7" style={{ color: '#F23E02' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Interface Intuitiva</h3>
                <p className="text-slate-600">
                  Design limpo e moderno. Adicione transações em segundos, sem complicação.
                  Tudo que você precisa, nada que você não precisa.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 152, 141, 0.1)' }}>
                  <PieChart className="w-7 h-7" style={{ color: '#00988D' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Visualização Clara</h3>
                <p className="text-slate-600">
                  Cards coloridos mostram suas receitas, despesas e saldo em tempo real.
                  Entenda suas finanças de um só olhar.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(44, 107, 116, 0.1)' }}>
                  <Calendar className="w-7 h-7" style={{ color: '#2C6B74' }} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Histórico Completo</h3>
                <p className="text-slate-600">
                  Navegue pelo histórico mês a mês. Veja padrões, acompanhe seu progresso
                  e tome decisões financeiras melhores.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(0, 152, 141, 0.05)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <Download className="w-16 h-16 mx-auto mb-6" style={{ color: '#00988D' }} />
            <h2 className="text-4xl font-bold mb-4 text-slate-800">Baixe o Seneb.</h2>
            <p className="text-xl text-slate-600 mb-8">
              Aplicativo nativo para Windows e Linux. Desempenho máximo, segurança e seus dados sempre protegidos.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleCTAClick}
                className="flex items-center gap-3 px-10 py-5 rounded-lg text-white font-bold text-xl transition-all shadow-lg transform hover:scale-105"
                style={{ backgroundColor: '#F23E02' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d63802'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F23E02'}
              >
                {isMounted && isMobile ? (
                  <><MonitorSmartphone className="w-6 h-6" /> Acesse pelo Computador</>
                ) : (
                  <><Download className="w-6 h-6 cursor-pointer" /> Baixar Instalador</>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* About Dev Section */}
        <section id="sobre-dev" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: 'rgba(242, 62, 2, 0.1)', color: '#F23E02' }}>
                  👨‍💻
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-4 text-slate-800">Sobre o Desenvolvedor</h2>
                  <p className="text-slate-600 mb-4">
                    Olá! Tudo bem? Sou o Matheus Amorim, criador do Seneb. Sou estudante de Ciência de Dados e IA na PUCSP, formado em Análise e Desenvolvimento de Sistemas e Analista de Infraestrutura e Projetos de TI.
                  </p>
                  <p className="text-slate-600">
                    Desenvolvido com Tauri, React, TypeScript e Tailwind CSS.
                    Focado em proporcionar a melhor experiência de usuário possível.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Changelogs Section */}
        <section id="changelogs" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(254, 245, 200, 0.3)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-slate-800">Changelogs</h2>
            <p className="text-xl text-slate-600 mb-8">
              Encontrou um bug? Tem uma sugestão? Adoraríamos ouvir você!
            </p>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-left">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Últimas Atualizações</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(242, 62, 2, 0.04)', border: '1px solid rgba(242, 62, 2, 0.15)' }}>
                  <CheckCircle className="w-5 h-5 mt-1 shrink-0" style={{ color: '#F23E02' }} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-slate-800 font-semibold">v0.4.0 - Metas Financeiras & Animações</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ backgroundColor: '#F23E02' }}>NOVO</span>
                      <span className="text-xs text-slate-400">17/05/2026</span>
                    </div>
                    <ul className="text-sm text-slate-500 space-y-1 list-none mt-2">
                      <li>• <strong>Sistema de Metas:</strong> crie metas financeiras com valor alvo, prazo e imagem personalizada; acompanhe o progresso em tempo real com barra de progresso</li>
                      <li>• <strong>Lançamentos vinculados a metas:</strong> ao registrar um lançamento do tipo Meta, o valor é automaticamente contabilizado na meta correspondente</li>
                      <li>• <strong>Animação de conquista:</strong> ao atingir 100% de uma meta, uma animação Lottie Trophy é exibida com som e celebração</li>
                      <li>• <strong>Reset inteligente:</strong> ao excluir um lançamento de meta que desmarca a conclusão, o sistema reseta o estado e permite celebrar novamente ao completar</li>
                      <li>• <strong>Componentes visuais custom:</strong> novo seletor dropdown (AppSelect) e calendário interativo (AppDateInput) seguindo a paleta de cores do app</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(0, 152, 141, 0.04)', border: '1px solid rgba(0, 152, 141, 0.15)' }}>
                  <CheckCircle className="w-5 h-5 mt-1 shrink-0" style={{ color: '#00988D' }} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-slate-800 font-semibold">v0.3.0 - Sessão Persistente, Boleto & Convites por E-mail</span>
                      <span className="text-xs text-slate-400">15/05/2026</span>
                    </div>
                    <ul className="text-sm text-slate-500 space-y-1 list-none mt-2">
                      <li>• <strong>Sessão de 30 dias:</strong> usuário continua conectado sem precisar fazer login todo dia</li>
                      <li>• <strong>Boleto disponível</strong> nas subcategorias Saúde › Plano de Saúde e Compras Pessoais › Roupas</li>
                      <li>• <strong>Convite por e-mail:</strong> ao convidar alguém para um grupo que ainda não tem conta, o Seneb envia um e-mail de boas-vindas automaticamente</li>
                      <li>• <strong>Página Sobre</strong> adicionada na tela inicial do app com versão e informações do produto</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 shrink-0" style={{ color: '#00988D' }} />
                  <div>
                    <div className="text-slate-800 font-semibold">v0.2.18 - Notificações Inteligentes e Grupos Compartilhados (04/04/2026)</div>
                    <div className="text-sm text-slate-500">Adicionada a central de convites com Sininho de notificações, Modais auto-injetados para aceitar ou recusar convidados e correção do Dark Mode nas páginas de Recuperação de Senha.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 shrink-0" style={{ color: '#00988D' }} />
                  <div>
                    <div className="text-slate-800 font-semibold">v0.2.8 - Temas, Categorias & Melhorias UI</div>
                    <div className="text-sm text-slate-500">Adicionados novos temas (Claro e Escuro), mais categorias de controle de gastos, animações fluidas na atualização do desktop e correções de navegação.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 shrink-0" style={{ color: '#00988D' }} />
                  <div>
                    <div className="text-slate-800 font-semibold">v0.2.7 - Auto Update</div>
                    <div className="text-sm text-slate-500">App atualiza sozinho no seu computador sem que você precise baixar manualmente.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 shrink-0" style={{ color: '#00988D' }} />
                  <div>
                    <div className="text-slate-800 font-semibold">Sistema de histórico por mês</div>
                    <div className="text-sm text-slate-500">Navegue pelas transações de cada mês, reabra meses encerrados com toda segurança.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 shrink-0" style={{ color: '#00988D' }} />
                  <div>
                    <div className="text-slate-800 font-semibold">Lançamento Inicial</div>
                    <div className="text-sm text-slate-500">Lançamento com funcionalidades essenciais (Painel de Controle, Receitas e Despesas).</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <h4 className="text-lg font-bold mb-4 text-slate-800">Reportar um problema</h4>
                <p className="text-slate-600 mb-4">
                  Entre em contato através do email: <span className="font-semibold" style={{ color: '#F23E02' }}>suporte@seneb.com.br</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-2xl p-12" style={{ border: '3px solid #F23E02' }}>
              <h2 className="text-4xl font-bold mb-4 text-slate-800">
                Pronto para começar?
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Junte-se a milhares de pessoas que já controlam suas finanças com facilidade
              </p>
              <button
                onClick={handleCTAClick}
                className="flex items-center mx-auto gap-2 px-12 py-5 rounded-xl text-white text-xl font-bold transition-all shadow-xl transform hover:scale-105"
                style={{ backgroundColor: '#F23E02' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d63802'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F23E02'}
              >
                {isMounted && isMobile ? (
                  <><MonitorSmartphone className="w-6 h-6" /> Acesse pelo PC</>
                ) : (
                  <><Download className="w-6 h-6 cursor-pointer" /> Baixar Agora</>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal de Download */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDownloadModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center" style={{ background: 'linear-gradient(to right, rgba(0, 152, 141, 0.1), rgba(44, 107, 116, 0.1))' }}>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Escolha a sua versão</h3>
                <p className="text-slate-600 text-sm mt-1">Selecione o seu sistema operacional abaixo</p>
              </div>
              <button 
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Corpo Modal */}
            <div className="p-6 space-y-4">
              {/* Opção Windows */}
              <a 
                href="/Seneb-Setup.msi"
                onClick={() => setIsDownloadModalOpen(false)}
                className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-[#00988D] hover:bg-[#00988D]/5 transition-all group cursor-pointer"
              >
                <div className="p-3 bg-[#00988D]/10 text-[#00988D] rounded-lg group-hover:scale-110 transition-transform">
                  <Monitor className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    Windows
                    <span className="text-xs px-2 py-0.5 bg-[#00988D]/20 text-[#00988D] rounded-full">Recomendado</span>
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">Instalador nativo (.msi) para Windows 10 e 11</p>
                </div>
                <Download className="w-5 h-5 text-slate-300 group-hover:text-[#00988D] mt-4" />
              </a>

              {/* Opção Linux AppImage */}
              <a 
                href="/Seneb-Setup.AppImage"
                onClick={() => setIsDownloadModalOpen(false)}
                className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-[#F23E02] hover:bg-[#F23E02]/5 transition-all group cursor-pointer"
              >
                <div className="p-3 bg-[#F23E02]/10 text-[#F23E02] rounded-lg group-hover:scale-110 transition-transform">
                  <Terminal className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-800">Linux (AppImage)</h4>
                  <p className="text-sm text-slate-500 mt-1">Executável universal para qualquer distribuição Linux</p>
                </div>
                <Download className="w-5 h-5 text-slate-300 group-hover:text-[#F23E02] mt-4" />
              </a>

              {/* Opção Linux Deb */}
              <a 
                href="/Seneb-Setup.deb"
                onClick={() => setIsDownloadModalOpen(false)}
                className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-[#2C6B74] hover:bg-[#2C6B74]/5 transition-all group cursor-pointer"
              >
                <div className="p-3 bg-[#2C6B74]/10 text-[#2C6B74] rounded-lg group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-800">Linux (.deb)</h4>
                  <p className="text-sm text-slate-500 mt-1">Instalador para Ubuntu, Debian, Mint e derivados</p>
                </div>
                <Download className="w-5 h-5 text-slate-300 group-hover:text-[#2C6B74] mt-4" />
              </a>
            </div>
            
            <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 border-t border-slate-100">
              O download do arquivo de instalação iniciará automaticamente após a seleção.
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-white py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to right, #013750, #2C6B74)' }}>
        <div className="max-w-7xl mx-auto justify-center items-center">
          <div className="grid md:grid-cols-4 gap-8 mb-8 justify-center items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6" />
                <span className="text-xl font-bold">Seneb</span>
              </div>
              <p className="text-white/70 text-sm">
                Controle financeiro pessoal simples e eficaz.
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/70">
            © {new Date().getFullYear()} Seneb. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}