import React, { useState, useEffect } from 'react';
import {
  FolderEdit,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FolderCheck,
  Building2,
} from 'lucide-react';

interface FolderRenameViewProps {
  onRenameFolder?: (payload: { targetPath: string; newName: string; company?: string }) => Promise<{ success: boolean; newPath?: string; error?: string }>;
}

export const FolderRenameView: React.FC<FolderRenameViewProps> = ({ onRenameFolder }) => {
  const [company, setCompany] = useState<string>('RTO');
  const [config, setConfig] = useState<any>(null);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [currentFolderName, setCurrentFolderName] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string; newPath?: string } | null>(null);

  // Carrega configuração de empresas disponíveis
  useEffect(() => {
    window.electronAPI?.getConfig().then((allCfg) => {
      setConfig(allCfg);
      const keys = allCfg ? Object.keys(allCfg).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword') : [];
      if (keys.length > 0 && !keys.includes(company)) {
        setCompany(keys.includes('RTO') ? 'RTO' : keys[0]);
      }
    });

    const unsub = window.electronAPI?.onConfigUpdated?.((updatedCfg) => {
      setConfig(updatedCfg);
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const companyKeys = config ? Object.keys(config).filter((k) => k !== 'isLockedByMSI' && k !== 'tiLogsPassword') : ['RTO', 'RELIQUIA'];

  // Diálogo para escolher a pasta
  const handleSelectFolder = async () => {
    setStatusMessage(null);
    const defaultStart = selectedPath || config?.[company]?.destSharePath || config?.[company]?.allowedBasePath || undefined;
    const pathChosen = await window.electronAPI?.selectDirectory(defaultStart);
    if (pathChosen) {
      setSelectedPath(pathChosen);
      const base = pathChosen.replace(/[\\/]+$/, '').split(/[\\/]/).pop() || '';
      setCurrentFolderName(base);
      setNewFolderName(base);
    }
  };

  // Validação e Execução da Renomeação
  const handleExecuteRename = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!selectedPath) {
      setStatusMessage({ type: 'error', message: 'Selecione uma pasta para renomear.' });
      return;
    }

    const trimmedNewName = newFolderName.trim();
    if (!trimmedNewName) {
      setStatusMessage({ type: 'error', message: 'O novo nome da pasta não pode estar vazio.' });
      return;
    }

    // Caracteres proibidos no Windows: \ / : * ? " < > |
    const invalidCharsRegex = /[\\/:*?"<>|]/;
    if (invalidCharsRegex.test(trimmedNewName)) {
      setStatusMessage({
        type: 'error',
        message: 'O novo nome contém caracteres não permitidos pelo Windows: \\ / : * ? " < > |',
      });
      return;
    }

    if (currentFolderName.toLowerCase() === trimmedNewName.toLowerCase()) {
      setStatusMessage({
        type: 'error',
        message: 'O novo nome é idêntico ao nome atual da pasta. Digite uma alteração.',
      });
      return;
    }

    setIsRenaming(true);
    try {
      let result;
      if (onRenameFolder) {
        result = await onRenameFolder({
          targetPath: selectedPath,
          newName: trimmedNewName,
          company,
        });
      } else if (window.electronAPI?.renameFolder) {
        result = await window.electronAPI.renameFolder({
          targetPath: selectedPath,
          newName: trimmedNewName,
          company,
        });
      } else {
        throw new Error('Mecanismo de renomeação não disponível.');
      }

      if (result.success && result.newPath) {
        setStatusMessage({
          type: 'success',
          message: `Pasta renomeada com sucesso para '${trimmedNewName}'.`,
          newPath: result.newPath,
        });
        setSelectedPath(result.newPath);
        setCurrentFolderName(trimmedNewName);
        setNewFolderName(trimmedNewName);
      } else {
        setStatusMessage({
          type: 'error',
          message: result.error || 'Não foi possível renomear a pasta.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err.message || 'Erro inesperado durante a renomeação.',
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleReset = () => {
    setSelectedPath('');
    setCurrentFolderName('');
    setNewFolderName('');
    setStatusMessage(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 transition-colors select-none">
      {/* Top Controls: Company Toggle */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Empresa:</span>
          <div className="flex flex-wrap rounded-lg bg-slate-100 dark:bg-neutral-900 p-1 border border-slate-200 dark:border-neutral-700 gap-1">
            {companyKeys.map((key) => {
              const isSelected = company === key;
              const compName = config?.[key]?.companyName || key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCompany(key)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-teams-600 text-teams-700 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{compName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Principal de Renomeação */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-700/80 pb-4">
          <div className="w-9 h-9 rounded-lg bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
            <FolderEdit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Renomear Pasta
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecione uma pasta corporativa e informe a nova nomenclatura desejada
            </p>
          </div>
        </div>

        <form onSubmit={handleExecuteRename} className="space-y-5 max-w-3xl">
          {/* Passo 1: Selecionar Pasta */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Pasta a ser Renomeada
            </label>
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={handleSelectFolder}
                className="px-4 py-2.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shrink-0"
              >
                <FolderOpen className="w-4 h-4 text-teams-600 dark:text-teams-400" />
                <span>Selecionar Pasta...</span>
              </button>

              <div className="flex-1 p-2.5 bg-slate-50 dark:bg-neutral-950/60 border border-slate-200 dark:border-neutral-800 rounded-xl flex items-center overflow-hidden">
                {selectedPath ? (
                  <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate" title={selectedPath}>
                    {selectedPath}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Nenhuma pasta selecionada. Clique no botão ao lado.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Destaque do Nome Atual */}
          {currentFolderName && (
            <div className="p-3 bg-slate-50 dark:bg-neutral-950/40 border border-slate-200/80 dark:border-neutral-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Nome Atual da Pasta:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                {currentFolderName}
              </span>
            </div>
          )}

          {/* Passo 2: Digitar o Novo Nome */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Novo Nome da Pasta
            </label>
            <div className="relative">
              <input
                type="text"
                disabled={!selectedPath || isRenaming}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={selectedPath ? 'Digite o novo nome da pasta...' : 'Selecione uma pasta primeiro'}
                className="w-full p-3 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl font-medium text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-teams-600 focus:ring-1 focus:ring-teams-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Caracteres não permitidos: <code className="font-mono text-[10px] bg-slate-100 dark:bg-neutral-800 px-1 py-0.5 rounded">\ / : * ? " &lt; &gt; |</code>
            </p>
          </div>

          {/* Alertas de Status */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold leading-relaxed">{statusMessage.message}</p>
                {statusMessage.newPath && (
                  <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 opacity-90 truncate max-w-lg">
                    Novo local: {statusMessage.newPath}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800">
            {selectedPath && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isRenaming}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Limpar
              </button>
            )}

            <button
              type="submit"
              disabled={!selectedPath || !newFolderName.trim() || isRenaming}
              className="px-6 py-2.5 bg-teams-600 hover:bg-teams-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isRenaming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Renomeando...</span>
                </>
              ) : (
                <>
                  <FolderCheck className="w-4 h-4" />
                  <span>Renomear Pasta</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
