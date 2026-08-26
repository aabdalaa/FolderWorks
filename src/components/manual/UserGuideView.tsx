import React from 'react';
import { HelpCircle, BookOpen, ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';

export const UserGuideView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs text-slate-300">
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Manual do Usuário & Guia Técnico</h3>
            <p className="text-slate-400">Instruções de operação e diagnósticos de segurança da ferramenta Entropy FolderWorks</p>
          </div>
        </div>

        {/* Workflow Guide */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Como Funciona a Criação Segura de Pastas
          </h4>
          <p className="leading-relaxed">
            O aplicativo **Entropy FolderWorks** foi construído para criar a estrutura completa de pastas do cliente na rede sem conceder permissão de escrita direta aos usuários do departamento Paralegal.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
            <li>O operador escolhe a empresa de destino (**RELIQUIA** ou **RTO**).</li>
            <li>Informa o nome da pasta do cliente (ex: <span className="font-mono text-cyan-300">10572 - AERO 0010</span>).</li>
            <li>O aplicativo realiza uma consulta direta via LDAP no servidor Active Directory da empresa.</li>
            <li>Valida a existência do usuário de serviço <span className="font-mono text-cyan-300">pasta.paralegal</span>.</li>
            <li>Executa o utilitário nativo Win32 <span className="font-mono text-cyan-300">ExecuteAsUser.exe</span> (usando a API <span className="font-mono">CreateProcessWithLogonW</span>) sob as credenciais de <span className="font-mono">pasta.paralegal</span>.</li>
            <li>O Robocopy faz a transmissão multithreaded (<span className="font-mono">/MT:64 /COPY:DATS</span>) de todas as 7 subpastas modelo.</li>
          </ul>
        </div>

        <hr className="border-slate-800/80" />

        {/* Troubleshooting */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Tabela de Diagnóstico Rápido de Erros
          </h4>
          
          <div className="space-y-3 font-sans">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-rose-400 mb-1">[ERRO CRÍTICO AD] A conta de serviço 'pasta.paralegal' não foi encontrada...</div>
              <div className="text-slate-400">A conta <span className="font-mono text-cyan-300">pasta.paralegal</span> ainda não foi criada no Active Directory do servidor correspondente. Crie a conta no AD com a senha <span className="font-mono">Mestre@300</span>.</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-rose-400 mb-1">System Error 1219 do Windows SMB</div>
              <div className="text-slate-400">Tratado automaticamente pelo app. A validação usa consulta LDAP direta na porta 389/636 sem depender de conexões SMB.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
