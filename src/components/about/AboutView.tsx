import React from 'react';
import {
  Github,
  Linkedin,
  Instagram,
  ExternalLink,
  ShieldCheck,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';

interface AboutViewProps {
  onBack?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  const handleOpenLink = (url: string) => {
    window.electronAPI?.openExternal(url);
  };

  const socialLinks = [
    {
      name: 'GitHub',
      handle: '@aabdalaa',
      url: 'https://github.com/aabdalaa',
      icon: Github,
      color: 'hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white',
    },
    {
      name: 'LinkedIn',
      handle: '/in/andreabdala',
      url: 'https://www.linkedin.com/in/andreabdala/',
      icon: Linkedin,
      color: 'hover:border-blue-500/60 hover:text-blue-600 dark:hover:text-blue-400',
    },
    {
      name: 'Instagram',
      handle: '@_aabdala_',
      url: 'https://www.instagram.com/_aabdala_/',
      icon: Instagram,
      color: 'hover:border-pink-500/60 hover:text-pink-600 dark:hover:text-pink-400',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Botão de Retorno às operações */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-700 text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para as operações</span>
          </button>
        </div>
      )}

      {/* 1. Developer Profile Card */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teams-700 via-teams-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-teams-500/20 font-mono font-black text-2xl tracking-wider select-none">
              AA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">André Abdala</h3>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <UserCheck className="w-3 h-3" />
                  Desenvolvedor
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Desenvolvedor de Software & Arquiteto de Soluções
              </p>
            </div>
          </div>

          {/* Version badge */}
          <div className="text-right">
            <span className="text-[11px] font-mono font-bold text-teams-700 dark:text-teams-300 bg-teams-50 dark:bg-teams-950 px-3 py-1 rounded-lg border border-teams-200 dark:border-teams-800">
              v2.7.1 Oficial
            </span>
          </div>
        </div>

        {/* Social Media Buttons */}
        <div className="pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Canais de Contato & Redes Oficiais
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <button
                  key={social.name}
                  onClick={() => handleOpenLink(social.url)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-800/50 text-slate-700 dark:text-slate-300 transition-all hover:shadow-sm ${social.color} group`}
                  title={`Abrir ${social.name} no navegador`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold leading-tight">{social.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{social.handle}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-current transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. ENTROPY Identity & Philosophy Card */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teams-50 dark:bg-teams-950 flex items-center justify-center text-teams-600 dark:text-teams-400 border border-teams-200 dark:border-teams-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Ecossistema ENTROPY
          </h4>
        </div>

        <blockquote className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border-l-4 border-teams-600 text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          &ldquo;A transformação do caos, da complexidade técnica e da desordem do mundo real em sistemas funcionais, claros e controlados.&rdquo;
        </blockquote>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          O <strong>Entropy FolderWorks</strong> foi concebido para simplificar fluxos operacionais críticos e garantir a governança estrutural de arquivos em ambientes de rede corporativa. Combinando motores de alto rendimento sob impersonação de segurança nativa do Windows, o aplicativo entrega integridade e velocidade para usuários corporativos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Governança Estrita</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tratamento de permissões NTFS e perímetro rígido contra movimentações indevidas.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Cpu className="w-4 h-4 text-teams-600 dark:text-teams-400" />
              <span>Alta Performance</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Robocopy multi-thread integrado nativamente em C# sob token do Active Directory.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>UX Familiar & Fluent</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interface limpa, moderna e inspirada no ecossistema Microsoft Teams e Fluent Design.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Technical Specifications Card */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
            <Code2 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Ficha Técnica & Arquitetura
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">Versão da Build</span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">v2.7.1</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">Distribuição</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Windows MSI (WiX 3.14)</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">Frontend / Framework</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">React 18 & TypeScript</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">Motor Nativo Core</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">C# (.NET Advapi32 Win32)</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>FolderWorks — Ecossistema Entropy</span>
          <span>© 2026 André Abdala. Todos os direitos reservados.</span>
        </div>
      </div>
    </div>
  );
};

