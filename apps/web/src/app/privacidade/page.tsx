'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <div className="bg-teal-50 p-3 rounded-2xl">
            <ShieldCheck size={32} className="text-[#00988D]" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#013750]">Política de Privacidade</h1>
            <p className="text-slate-400 text-sm mt-1">Última atualização: 14 de março de 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-600 leading-relaxed text-lg">
          <p className="border-l-4 border-[#00988D] pl-6 py-2 italic bg-teal-50/30 rounded-r-xl font-medium">
            Esta Política de Privacidade descreve como o Seneb coleta, utiliza, armazena e protege dados pessoais, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD).
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">1</span>
              Controlador dos dados
            </h2>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="mb-2">O controlador dos dados pessoais é o responsável legal pela plataforma Seneb.</p>
              <div className="mt-4 space-y-2">
                <p><strong>Responsável:</strong> [nome ou empresa]</p>
                <p><strong>Email:</strong> [email de privacidade]</p>
                <p><strong>Endereço:</strong> [cidade/estado]</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">2</span>
              Dados coletados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-[#013750] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00988D]"></div>
                  Dados cadastrais
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-500">
                  <li>Nome</li>
                  <li>Email</li>
                  <li>Identificador de usuário</li>
                  <li>Senha criptografada</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-[#013750] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00988D]"></div>
                  Dados de uso
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-500">
                  <li>Informações de navegação</li>
                  <li>Registros de acesso</li>
                  <li>Dados técnicos do dispositivo</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 bg-[#013750] text-white p-8 rounded-3xl shadow-xl">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-teal-400">
                <ShieldCheck size={20} />
                Dados inseridos pelo usuário
              </h3>
              <p className="text-slate-300">
                Informações financeiras organizacionais: Categorias, registros e históricos inseridos na plataforma.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">3</span>
              Finalidade do tratamento
            </h2>
            <p className="mb-4">Os dados são tratados para:</p>
            <div className="flex flex-wrap gap-2">
              {["Permitir funcionamento da plataforma", "Autenticar usuários", "Garantir segurança da aplicação", "Melhorar funcionalidades", "Cumprir obrigações legais"].map(item => (
                <span key={item} className="bg-slate-100 px-4 py-2 rounded-full text-slate-700 font-medium text-sm">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">4</span>
              Base legal
            </h2>
            <p>O tratamento de dados ocorre com fundamento em: Execução de contrato, Legítimo interesse do controlador, Cumprimento de obrigação legal e Consentimento do titular quando aplicável.</p>
          </section>

          <section className="bg-teal-50/50 p-8 rounded-3xl border border-teal-100">
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">5</span>
              Compartilhamento de dados
            </h2>
            <p className="font-bold text-[#013750] mb-4">O Seneb não comercializa dados pessoais.</p>
            <p className="mb-2 text-slate-500 italic">O compartilhamento poderá ocorrer com:</p>
            <ul className="list-disc pl-6 space-y-1 text-slate-500">
              <li>Prestadores de serviços tecnológicos</li>
              <li>Serviços de envio de email</li>
              <li>Autoridades públicas quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">6</span>
              Armazenamento e segurança
            </h2>
            <p>Os dados são armazenados em ambiente tecnológico seguro, com medidas como criptografia de senhas, controle de acesso e monitoramento de segurança contra acessos não autorizados.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">7</span>
              Retenção de dados
            </h2>
            <p>Os dados serão mantidos enquanto a conta estiver ativa, pelo período necessário para cumprimento de obrigações legais ou até solicitação de exclusão pelo titular.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">8</span>
              Direitos do titular
            </h2>
            <p className="mb-4">Nos termos da LGPD, o titular pode solicitar:</p>
            <ul className="list-disc pl-6 space-y-1 font-medium text-[#013750]">
              <li>Confirmação de tratamento</li>
              <li>Acesso aos dados</li>
              <li>Correção de dados incompletos</li>
              <li>Anonimização ou exclusão</li>
              <li>Portabilidade</li>
              <li>Revogação do consentimento</li>
            </ul>
            <p className="mt-4 text-sm bg-slate-100 p-4 rounded-xl border-l-4 border-slate-300">
              As solicitações devem ser enviadas para o email informado nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">9</span>
              Transferência internacional
            </h2>
            <p>Os dados poderão ser armazenados em servidores localizados fora do Brasil, observadas as garantias legais previstas na LGPD.</p>
          </section>

          <section className="pt-10 border-t-2 border-slate-100">
            <h2 className="text-2xl font-bold text-[#013750] mb-4 flex items-center gap-3">
              <span className="bg-[#00988D] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif">10</span>
              Alterações nesta política
            </h2>
            <p>Esta política poderá ser atualizada a qualquer momento. A versão vigente será sempre disponibilizada na plataforma.</p>
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
