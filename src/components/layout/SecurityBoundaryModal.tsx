import React from 'react';
import { ShieldAlert, X, FolderLock, CheckCircle2, AlertOctagon } from 'lucide-react';

interface SecurityBoundaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chosenPath: string;
  allowedBasePath: string;
  company?: string;
}

export const SecurityBoundaryModal: React.FC<SecurityBoundaryModalProps> = ({
  isOpen,
  onClose,
  chosenPath,
  allowedBasePath,
  company,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 shadow-2xl p-6 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Botão Fechar (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Perímetro de Segurança Corporativo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Governança de TI {company ? `• ${company}` : ''}
            </p>
          </div>
        </div>

        {/* Mensagem Principal */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          A pasta selecionada está localizada fora do limite de pastas autorizado pela equipe de TI. Por motivos de segurança e integridade, as operações foram restritas a este perímetro.
        </p>

        {/* Detalhes dos Caminhos */}
        <div className="space-y-3 mb-5">
          {/* Caminho Bloqueado */}
          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-400 mb-1">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <span>Caminho Não Autorizado:</span>
            </div>
            <div className="font-mono text-[11px] text-rose-900 dark:text-rose-200 break-all select-text bg-white/70 dark:bg-neutral-900/60 p-2 rounded-lg border border-rose-200/60 dark:border-rose-900/40">
              {chosenPath || 'Nenhum caminho especificado'}
            </div>
          </div>

          {/* Perímetro Permitido */}
          <div className="p-3 rounded-xl bg-teams-50/70 dark:bg-teams-950/30 border border-teams-200 dark:border-teams-900/50">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-teams-700 dark:text-teams-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Perímetro Permitido de Segurança:</span>
            </div>
            <div className="font-mono text-[11px] text-teams-950 dark:text-teams-200 break-all select-text bg-white/70 dark:bg-neutral-900/60 p-2 rounded-lg border border-teams-200/60 dark:border-teams-900/40">
              {allowedBasePath || 'Consulte o suporte de TI'}
            </div>
          </div>
        </div>

        {/* Rodapé / Ações */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-700/60">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Dúvidas? Consulte a equipe de TI.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teams-600 hover:bg-teams-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
