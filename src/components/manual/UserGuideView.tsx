import React from 'react';
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
    <div className="space-y-6 max-w-5xl mx-auto text-xs text-slate-700 dark:text-slate-300 select-none pb-10">
      {/* Header do Manual */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teams-50 dark:bg-teams-950/80 border border-teams-200 dark:border-teams-800 flex items-center justify-center text-teams-600 dark:text-teams-400 shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
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
              O sistema criará automaticamente a estrutura corporativa padronizada copiando o modelo de pastas criado no Active Directory para o diretório de destino.
            </li>
            <li>
              Uma notificação de confirmação em verde indicará a conclusão da operação.
            </li>
          </ol>

          {/* Replicação da Estrutura Modelo Corporativa */}
          <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <Layers className="w-4 h-4 text-teams-600 dark:text-teams-400" />
              <span>Replicação Automática do Modelo de Pastas</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              O sistema copia fielmente o modelo de pastas corporativo padronizado no Active Directory para o diretório de destino selecionado, garantindo a organização institucional, herança e permissões de segurança de rede apropriadas sem necessidade de configuração manual.
            </p>
          </div>
        </section>

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
        </section>

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
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span>O que acontece se a pasta já existir no destino?</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                O aplicativo realiza uma pré-verificação antes da transmissão. Se já houver um diretório com o mesmo nome na pasta de destino, o sistema emitirá um alerta explícito na tela para evitar qualquer sobreposição ou perda acidental de dados.
              </div>
            </div>

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
        </section>
      </div>
    </div>
  );
};
