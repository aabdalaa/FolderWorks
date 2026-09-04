import React, { useState, useEffect } from 'react';
import { History, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    window.electronAPI?.getHistory().then((h) => setHistory(h));
  }, []);

  const handleClear = async () => {
    const updated = await window.electronAPI?.clearHistory();
    setHistory(updated || []);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">Histórico de Operações</h3>
              <p className="text-xs text-slate-400">Registro de criações e transferências executadas</p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 text-xs rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs italic">
            Nenhuma criação registrada até o momento...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50">
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3">Duração</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="p-3 text-slate-400">{item.timestamp}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.company === 'RELIQUIA' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-purple-950 text-purple-400 border border-purple-800'}`}>
                        {item.company}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200 font-bold">{item.folderName}</td>
                    <td className="p-3 text-slate-400">{item.executedBy}</td>
                    <td className="p-3 text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.durationSeconds}s</span>
                    </td>
                    <td className="p-3">
                      {item.status === 'SUCCESS' ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sucesso
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Abortado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
