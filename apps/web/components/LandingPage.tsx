"use client";

import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Download, 
  CheckCircle, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';

export default function LandingPage() {
  const handleCTAClick = () => {
    alert('Em breve! O app estará disponível para acesso.');
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
                href="#bugs" 
                className="px-4 py-2 hover:text-white/80 transition-colors"
              >
                Bugs e Atualizações
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCTAClick}
                className="px-6 py-2 rounded-lg transition-colors text-white border-2 border-white/30 hover:bg-white/10"
              >
                Entrar
              </button>
              <button
                onClick={handleCTAClick}
                className="px-6 py-2 rounded-lg text-white transition-all shadow-lg transform hover:scale-105"
                style={{ backgroundColor: '#F23E02' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d63802'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F23E02'}
              >
                Começar Grátis
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <nav className="md:hidden flex items-center gap-4 mt-4 flex-wrap">
            <Link href="#download" className="text-sm px-3 py-1 rounded-lg flex items-center" style={{ backgroundColor: 'rgba(0, 152, 141, 0.2)' }}>
              <Download className="w-4 h-4 inline mr-1" />
              Download
            </Link>
            <Link href="#sobre-dev" className="text-sm px-3 py-1">Sobre o Dev</Link>
            <Link href="#bugs" className="text-sm px-3 py-1">Bugs</Link>
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
                    className="flex items-center gap-2 px-8 py-4 rounded-xl text-white text-lg font-semibold transition-all shadow-xl transform hover:scale-105"
                    style={{ backgroundColor: '#F23E02' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d63802'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F23E02'}
                  >
                    Começar Agora
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleCTAClick}
                    className="px-8 py-4 rounded-xl text-slate-700 text-lg font-semibold transition-all border-2 hover:bg-white"
                    style={{ borderColor: '#013750' }}
                  >
                    Ver Demo
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
              Disponível como aplicação web. Acesse de qualquer dispositivo, 
              a qualquer momento. Sem instalação necessária!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleCTAClick}
                className="px-8 py-4 rounded-xl text-white text-lg font-bold transition-all shadow-lg transform hover:scale-105"
                style={{ backgroundColor: '#F23E02' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d63802'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F23E02'}
              >
                Acessar Agora
              </button>
              <button className="px-8 py-4 rounded-xl bg-white text-slate-700 text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Salvar na Área de Trabalho
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
                    Aluno do terceiro semestre de Ciência de Dados e IA da PUC e Analista de Infraestrutura e Projetos de TI.
                  </p>
                  <p className="text-slate-600">
                    Desenvolvido com React, TypeScript e Tailwind CSS. 
                    Focado em proporcionar a melhor experiência de usuário possível.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bugs Section */}
        <section id="bugs" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgba(254, 245, 200, 0.3)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-slate-800">Bugs e Atualizações</h2>
            <p className="text-xl text-slate-600 mb-8">
              Encontrou um bug? Tem uma sugestão? Adoraríamos ouvir você!
            </p>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-left">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Últimas Atualizações</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#00988D' }} />
                  <div>
                    <div className="text-slate-800 font-semibold">v1.0.0 - Interface inicial</div>
                    <div className="text-sm text-slate-500">Lançamento com funcionalidades essenciais</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#00988D' }} />
                  <div>
                    <div className="text-slate-800 font-semibold">Sistema de histórico por mês</div>
                    <div className="text-sm text-slate-500">Navegue pelas transações de cada mês</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#00988D' }} />
                  <div>
                    <div className="text-slate-800 font-semibold">Design responsivo</div>
                    <div className="text-sm text-slate-500">Funciona perfeitamente em todos os dispositivos</div>
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
                className="px-12 py-5 rounded-xl text-white text-xl font-bold transition-all shadow-xl transform hover:scale-105"
                style={{ backgroundColor: '#F23E02' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d63802'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F23E02'}
              >
                Criar Conta Grátis
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-white py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to right, #013750, #2C6B74)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6" />
                <span className="text-xl font-bold">Seneb</span>
              </div>
              <p className="text-white/70 text-sm">
                Controle financeiro pessoal simples e eficaz.
              </p>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold">Produto</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="#" className="hover:text-white transition-colors">Recursos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Preços</Link></li>
                <li><Link href="#download" className="hover:text-white transition-colors">Download</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold">Suporte</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="#bugs" className="hover:text-white transition-colors">Bugs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="#" className="hover:text-white transition-colors">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Termos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
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