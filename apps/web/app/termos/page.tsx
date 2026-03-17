'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-teal-100">
      {/* Header / Nav */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-[#00988D] transition-colors font-medium text-sm group">
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Voltar para o Início
          </Link>
          <div className="flex items-center gap-2 font-serif font-bold text-lg text-[#013750]">
            <div className="w-8 h-8 bg-gradient-to-br from-[#013750] to-[#015175] rounded-lg flex items-center justify-center text-white text-xs">S</div>
            Seneb
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-slate-50 p-3 rounded-2xl">
            <FileText size={32} className="text-[#013750]" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#013750]">Termos de Uso</h1>
            <p className="text-slate-400 text-sm mt-1">Última atualização: 14 de março de 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-600 leading-relaxed text-lg">
          <p className="border-l-4 border-[#013750] pl-6 py-2 italic bg-slate-50 rounded-r-xl">
            Estes Termos de Uso regulam o acesso e utilização do sistema Seneb, disponibilizado em formato de software como serviço (SaaS), acessível por meio de aplicação web e aplicativo desktop. Ao acessar ou utilizar o Seneb, o usuário declara ter lido, compreendido e concordado integralmente com estes termos.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#013750] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Definições
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p><strong>Plataforma:</strong> sistema Seneb</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p><strong>Usuário:</strong> pessoa física ou jurídica que utiliza o sistema</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p><strong>Serviço:</strong> funcionalidades disponibilizadas pela plataforma</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p><strong>Dados:</strong> informações inseridas pelo usuário no sistema</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#013750] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Objeto do serviço
            </h2>
            <p>
              O Seneb consiste em uma plataforma digital destinada à organização e visualização de dados financeiros pessoais ou empresariais. O serviço possui natureza informativa e organizacional, não constituindo consultoria financeira, contábil ou jurídica.
            </p>
          </section>

          <section className="bg-[#FEF5C8]/40 p-8 rounded-3xl border border-[#FEF5C8]">
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#013750] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Cadastro e acesso
            </h2>
            <p className="mb-4">Para utilização do sistema, o usuário deverá:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Manter a confidencialidade de suas credenciais</li>
              <li>Responsabilizar-se por todas as atividades realizadas em sua conta</li>
            </ul>
            <p className="mt-4 font-medium">A plataforma poderá adotar mecanismos de verificação de identidade e segurança.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#013750] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
              Responsabilidades do usuário
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizar o sistema em conformidade com a legislação vigente</li>
              <li>Não utilizar a plataforma para fins ilícitos</li>
              <li>Não tentar acessar dados de terceiros</li>
              <li>Não comprometer a segurança da aplicação</li>
            </ul>
          </section>

          <section className="bg-red-50/50 p-8 rounded-3xl border border-red-100">
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
              Limitação de responsabilidade
            </h2>
            <p className="mb-4">O Seneb não se responsabiliza por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Decisões financeiras tomadas com base nas informações do sistema</li>
              <li>Perdas decorrentes de uso inadequado da plataforma</li>
              <li>Indisponibilidades temporárias por manutenção ou falhas técnicas</li>
              <li>Perda de dados decorrente de culpa exclusiva do usuário</li>
            </ul>
            <p className="mt-4 font-bold text-red-600">O serviço é disponibilizado no estado em que se encontra.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#013750] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
              Propriedade intelectual
            </h2>
            <p>Todo o conteúdo da plataforma, incluindo código, layout, marca, funcionalidades e design, é protegido por legislação de propriedade intelectual.</p>
            <p className="mt-4 font-bold mb-2 text-[#00988D]">É vedado:</p>
            <ul className="list-disc pl-6 space-y-2 text-[#00988D]">
              <li>Copiar, modificar ou redistribuir o software sem autorização</li>
              <li>Realizar engenharia reversa</li>
              <li>Explorar comercialmente a plataforma sem permissão expressa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#013750] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">7</span>
              Suspensão e encerramento de conta
            </h2>
            <p>A conta poderá ser suspensa ou encerrada em caso de violação destes termos, uso indevido do sistema ou atividades que comprometam a segurança da plataforma. O usuário poderá solicitar a exclusão da conta a qualquer momento.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#013750] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">8</span>
              Alterações nos termos
            </h2>
            <p>O Seneb poderá atualizar estes termos periodicamente. A continuidade do uso da plataforma após alterações implica aceitação das novas condições.</p>
          </section>

          <section className="pt-10 border-t-2 border-slate-100">
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#013750] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">9</span>
              Legislação aplicável e foro
            </h2>
            <p>Este termo é regido pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de [cidade/estado], com renúncia de qualquer outro, por mais privilegiado que seja.</p>
          </section>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">© 2026 Seneb. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
