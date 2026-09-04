import React from 'react';
import { BookOpen, FolderPlus, FolderOutput, CheckCircle2, HelpCircle } from 'lucide-react';

export const UserGuideView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs text-slate-700 dark:text-slate-300">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-700/80 pb-4">
          <div className="w-10 h-10 rounded-xl bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Manual do Usuário</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Instruções simples de operação do Entropy FolderWorks</p>
          </div>
        </div>

        {/* Task 1: Como Criar Pastas */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-teams-600 dark:text-teams-400 flex items-center gap-2">
            <FolderPlus className="w-4 h-4" />
            1. Como Criar uma Nova Pasta de Cliente
          </h4>
          <ol className="list-decimal list-inside space-y-2 pl-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li>Na tela inicial <strong>Criar Pastas</strong>, selecione a empresa desejada (<strong>RELIQUIA</strong> ou <strong>RTO</strong>).</li>
            <li>No campo de texto, digite o código e nome do cliente seguindo o padrão oficial (Exemplo: <span className="font-mono text-teams-600 dark:text-teams-400 font-semibold">10572 - AERO 0010</span>).</li>
            <li>Clique no botão <strong>Criar Pastas</strong>.</li>
            <li>O aplicativo criará automaticamente a pasta principal e todas as 7 subpastas padrão no servidor da empresa selecionada.</li>
            <li>Uma mensagem de confirmação em verde indicará que a operação foi concluída.</li>
          </ol>
        </div>

        <hr className="border-slate-100 dark:border-neutral-700" />

        {/* Task 2: Como Transferir Pastas */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-teams-600 dark:text-teams-400 flex items-center gap-2">
            <FolderOutput className="w-4 h-4" />
            2. Como Mover ou Transferir Pastas
          </h4>
          <ol className="list-decimal list-inside space-y-2 pl-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li>Acesse a aba <strong>Mover / Transferir Pastas</strong> no menu lateral.</li>
            <li>Selecione a empresa correspondente.</li>
            <li>Escolha a pasta de destino (você pode utilizar os botões de atalho rápido como <span className="font-mono text-xs font-semibold">00 - EX CLIENTES</span>).</li>
            <li>Na lista de pastas, localize o cliente desejado pela barra de pesquisa ou clique em <strong>SELECIONAR TODAS</strong>.</li>
            <li>Clique em <strong>Iniciar Transferência</strong>.</li>
            <li>Ao final da cópia, confirme se deseja remover as pastas da origem ou mantê-las como cópia de segurança.</li>
          </ol>
        </div>

        <hr className="border-slate-100 dark:border-neutral-700" />

        {/* FAQ & Dicas */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Dúvidas Frequentes & Recomendações
          </h4>
          <div className="space-y-3 font-sans">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">A pasta já existe no destino</div>
              <div className="text-slate-500 dark:text-slate-400">Se o cliente já tiver pasta criada com o mesmo nome no destino, o aplicativo avisará para evitar substituições indesejadas.</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Não fechar o aplicativo durante a transferência</div>
              <div className="text-slate-500 dark:text-slate-400">Durante uma cópia de pastas, aguarde a barra de progresso finalizar antes de fechar a janela, garantindo que todos os arquivos sejam transmitidos por completo.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
