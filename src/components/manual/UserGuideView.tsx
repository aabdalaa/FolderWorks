import React from 'react';
import { BookOpen, FolderPlus, FolderOutput, CheckCircle2, HelpCircle, Layers } from 'lucide-react';
import {
  BookOpen,
  FolderPlus,
  FolderOutput,
  Terminal,
  ShieldCheck,
  History,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Lock,
  FileText,
  Sparkles
} from 'lucide-react';

export const UserGuideView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs text-slate-700 dark:text-slate-300">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-neutral-700/80 pb-4">
          <div className="w-10 h-10 rounded-xl bg-teams-50 dark:bg-teams-950/60 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400">
            <BookOpen className="w-5 h-5" />
    <div className="space-y-6 max-w-5xl mx-auto text-xs text-slate-700 dark:text-slate-300 select-none pb-10">
      {/* Header do Manual */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teams-50 dark:bg-teams-950/80 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400 shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Manual do Usuário</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Instruções simples de operação do Entropy FolderWorks</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Manual do Usuário & Guia Operacional
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Orientações passo a passo, boas práticas de uso e governança do Entropy FolderWorks
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
          <span>Documentação Oficial</span>
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
      {/* Conteúdo Principal */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Seção 1: Como Criar Pastas de Clientes */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Como Criar uma Nova Pasta de Cliente
            </h4>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            O módulo de criação padroniza a abertura de diretórios no servidor de arquivos corporativo, assegurando que a estrutura necessária seja criada instantaneamente com as permissões corretas de cada departamento.
          </p>

          <ol className="list-decimal list-inside space-y-2.5 pl-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li>
              Acesse a aba <strong>Criação de Pastas</strong> no menu lateral do aplicativo.
            </li>
            <li>
              Selecione o <strong>servidor ou unidade de trabalho</strong> correspondente à operação.
            </li>
            <li>
              No campo <em>Nome ou Código da Nova Pasta</em>, digite a identificação do cliente de acordo com o padrão cadastral do escritório (Exemplo ilustrativo: <span className="font-mono text-teams-600 dark:text-teams-400 font-semibold">0001 - CLIENTE EXEMPLO LTDA</span>).
            </li>
            <li>
              Clique no botão <strong>Criar Pasta de Cliente</strong>.
            </li>
            <li>
              O sistema criará automaticamente o diretório raiz e as 7 subpastas departamentais padronizadas no servidor de arquivos.
            </li>
            <li>
              Uma notificação de confirmação em verde indicará a conclusão da operação.
            </li>
          </ol>

          {/* Subpastas Padrão Criadas pelo Sistema */}
          <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 space-y-3">
          {/* Subpastas Padrão Geradas Automaticamente */}
          <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <Layers className="w-4 h-4 text-teams-600 dark:text-teams-400" />
              <span>Subpastas Padrão Geradas Automaticamente (7 Pastas)</span>
              <span>Subpastas Padrão Geradas Automaticamente (7 Departamentos)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Ao criar um cliente, a estrutura abaixo é replicada integralmente no servidor com as permissões restritas de cada departamento:
              Toda nova pasta criada recebe automaticamente a seguinte estrutura organizacional interna para arquivamento ordenado dos documentos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs shadow-2xs">
                <span className="font-mono font-bold text-teams-600 dark:text-teams-400">CONTABILIDADE</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Livros diários e balancetes</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Livros diários, balancetes e demonstrações</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs shadow-2xs">
                <span className="font-mono font-bold text-teams-600 dark:text-teams-400">DP</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Folha de pagamento e guias</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Folha de pagamento, contratações e guias</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs shadow-2xs">
                <span className="font-mono font-bold text-teams-600 dark:text-teams-400">EXPEDIÇÃO</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Documentos e transporte</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Documentos e comprovantes de transporte</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs shadow-2xs">
                <span className="font-mono font-bold text-teams-600 dark:text-teams-400">FISCAL</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Notas fiscais e impostos</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Notas fiscais, apuração e impostos</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs shadow-2xs">
                <span className="font-mono font-bold text-teams-600 dark:text-teams-400">PARALEGAL</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Contratos e certidões</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Contratos sociais, certidões e registros</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs shadow-2xs">
                <span className="font-mono font-bold text-teams-600 dark:text-teams-400">RH</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Treinamentos e medicina</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Gestão de pessoas, exames e treinamentos</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs sm:col-span-2">
              <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs shadow-2xs sm:col-span-2">
                <span className="font-mono font-bold text-teams-600 dark:text-teams-400">SPED</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Arquivos de obrigações acessórias eletrônicas</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Arquivos digitais e escriturações acessórias eletrônicas</span>
              </div>
            </div>
          </div>
        </div>
        </section>

        <hr className="border-slate-100 dark:border-neutral-700" />
        {/* Seção 2: Como Mover ou Transferir Pastas */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <FolderOutput className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Como Mover ou Transferir Pastas entre Diretórios
            </h4>
          </div>

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
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            A ferramenta de transferência permite remanejar pastas inteiras (por exemplo, ao encerrar contratos ou reorganizar clientes) com alta velocidade e verificação contínua de integridade.
          </p>

          <ol className="list-decimal list-inside space-y-2.5 pl-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li>
              Acesse a aba <strong>Transferência</strong> no menu lateral.
            </li>
            <li>
              Selecione o <strong>servidor ou ambiente de arquivos</strong> correspondente.
            </li>
            <li>
              <strong>Para onde vai a pasta?</strong>: Selecione o destino desejado. Você pode utilizar os botões de atalho rápido definidos pela governança do escritório ou selecionar outro diretório autorizado pelo sistema.
            </li>
            <li>
              <strong>Onde está a pasta?</strong>: Localize a pasta desejada no painel de listagem. Utilize o campo de busca rápida digitando parte do código ou nome do cliente.
            </li>
            <li>
              Marque as caixas de seleção das pastas que deseja transferir. Para remanejar todos os itens exibidos, clique em <strong>SELECIONAR TODAS</strong>.
            </li>
            <li>
              Clique no botão <strong>Iniciar Transferência</strong>. Uma janela com o progresso em tempo real acompanhará a transmissão segura.
            </li>
            <li>
              Ao término da cópia, o sistema questionará se deseja manter os arquivos na pasta de origem ou removê-los com segurança para liberar espaço.
            </li>
          </ol>
        </div>
        </section>

        <hr className="border-slate-100 dark:border-neutral-700" />
        {/* Seção 3: Registro de Atividades e Logs (Suporte & TI) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              3. Como Acessar o Registro de Atividades e Logs (Equipe Técnica & TI)
            </h4>
          </div>

        {/* FAQ & Dicas */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Dúvidas Frequentes & Recomendações
          </h4>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            O aplicativo dispõe de um módulo de auditoria e telemetria profunda para diagnóstico de rede, transmissões de arquivos e validação de permissões no servidor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Onde encontrar o botão de logs?</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Para manter a interface limpa e segura para os operadores do escritório, o botão de acesso aos logs fica discretamente posicionado no <strong>canto inferior direito da tela</strong> (<span className="font-mono text-xs font-bold text-teams-600 dark:text-teams-400">REGISTRO TI</span>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Acesso Privado e Protegido por Credencial</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Ao clicar no botão, uma tela de segurança solicitará a credencial do TI configurada nas variáveis de ambiente da aplicação. Isso impede acesso não autorizado a dados técnicos e parâmetros de infraestrutura.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-2.5">
            <div className="text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-teams-600 dark:text-teams-400" />
              <span>Recursos Disponíveis no Painel de Registro de Atividades:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 pl-1 leading-relaxed">
              <li><strong>Telemetria em Tempo Real</strong>: Acompanhe as etapas de varredura, chamadas de rede e throughput de cópia de arquivos.</li>
              <li><strong>Categorização por Cores</strong>: Mensagens de sucesso são destacadas em verde, avisos em amarelo e eventuais falhas em vermelho.</li>
              <li><strong>Limpeza de Histórico</strong>: Botão para resetar o buffer de exibição da sessão de trabalho.</li>
              <li><strong>Exportação em Arquivo (.txt)</strong>: Opção para abrir o relatório de eventos no editor padrão do Windows para anexar em chamados ou laudos técnicos de auditoria.</li>
              <li><strong>Bloqueio Imediato</strong>: Botão para fechar e travar a sessão de TI logo após a inspeção.</li>
            </ul>
          </div>
        </section>

        {/* Seção 4: Histórico de Auditoria */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <History className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              4. Acompanhamento de Operações Anteriores (Histórico)
            </h4>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Na aba <strong>Histórico</strong> do menu lateral, os operadores podem consultar o registro permanente de todas as pastas criadas e transferidas. Cada registro armazena:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Data & Hora</div>
              <div className="font-semibold text-xs text-slate-700 dark:text-slate-300 mt-0.5">Momento exato</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Pasta / Cliente</div>
              <div className="font-semibold text-xs text-slate-700 dark:text-slate-300 mt-0.5">Nome do diretório</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Status</div>
              <div className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Sucesso / Falha</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Duração</div>
              <div className="font-semibold text-xs text-slate-700 dark:text-slate-300 mt-0.5">Tempo em segundos</div>
            </div>
          </div>
        </section>

        {/* Seção 5: Dúvidas Frequentes & Recomendações */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              5. Dúvidas Frequentes, Governança & Recomendações
            </h4>
          </div>

          <div className="space-y-3 font-sans">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">A pasta já existe no destino</div>
              <div className="text-slate-500 dark:text-slate-400">Se o cliente já tiver pasta criada com o mesmo nome no destino, o aplicativo avisará para evitar substituições indesejadas.</div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span>O que acontece se a pasta já existir no destino?</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                O aplicativo realiza uma pré-verificação antes da transmissão. Se já houver um diretório com o mesmo nome na pasta de destino, o sistema emitirá um alerta explícito na tela para evitar qualquer sobreposição ou perda acidental de dados.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Não fechar o aplicativo durante a transferência</div>
              <div className="text-slate-500 dark:text-slate-400">Durante uma cópia de pastas, aguarde a barra de progresso finalizar antes de fechar a janela, garantindo que todos os arquivos sejam transmitidos por completo.</div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Por que não se deve fechar o aplicativo durante a transferência?</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Durante a cópia, o aplicativo ativa uma camada de proteção visual que bloqueia o fechamento acidental da janela (incluindo atalhos como Alt+F4). Isso assegura que o fluxo de transmissão de arquivos e a replicação de permissões sejam concluídos integralmente sem corrupção de dados na rede.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teams-600 dark:text-teams-400" />
                <span>Perímetro de Segurança e Governança Corporativa</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                O aplicativo possui regras estritas de perímetro corporativo. Destinos fora do limite aprovado pelas políticas de TI são automaticamente bloqueados para impedir que pastas de clientes sejam movidas inadvertidamente para diretórios públicos ou áreas não autorizadas da rede.
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>
    </div>
  );
};
