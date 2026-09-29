import React, { useState } from 'react';
import { Shield, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface FirstRunPasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const FirstRunPasswordModal: React.FC<FirstRunPasswordModalProps> = ({ isOpen, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmed) {
      setError('Por favor, informe a senha de Administrador (TI).');
      return;
    }

    if (trimmed.length < 4) {
      setError('A senha deve conter no mínimo 4 caracteres para segurança.');
      return;
    }

    if (trimmed !== trimmedConfirm) {
      setError('A confirmação da senha não coincide. Digite novamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await window.electronAPI?.setTIPassword(trimmed);
      if (res?.success) {
        onSuccess();
      } else {
        setError(res?.error || 'Falha ao salvar a senha de TI.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado ao definir a senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 sm:p-8 text-center relative">
        <div className="w-14 h-14 rounded-2xl bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800/80 flex items-center justify-center text-teams-600 dark:text-teams-400 mx-auto mb-4 shadow-sm">
          <Shield className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-teams-50 dark:bg-teams-950/80 text-teams-700 dark:text-teams-300 border border-teams-200 dark:border-teams-800/60 mb-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Primeiro Acesso ao Sistema</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Definição da Senha de TI
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Para garantir a governança corporativa e proteger os parâmetros de rede, caminhos compartilhados e identidades das empresas, defina a senha mestra de Administrador (TI) deste ambiente.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nova Senha do TI
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a nova senha..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teams-500 outline-none pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teams-500 outline-none pr-10"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !password.trim() || !confirmPassword.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-teams-600 hover:bg-teams-700 active:bg-teams-800 text-white shadow-lg shadow-teams-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando Senha...' : 'Salvar Senha e Liberar Sistema'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
