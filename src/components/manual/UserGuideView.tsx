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
  Lock,
  FileText,
  Edit3,
  Clock
} from 'lucide-react';

export const UserGuideView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto text-xs text-slate-700 dark:text-slate-300 select-none pb-10">
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
        {/* Seção 1: Como Criar uma Nova Pasta */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Como Criar uma Nova Pasta
            </h4>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            O módulo de criação padroniza a abertura de diretórios no ambiente corporativo, assegurando que a estrutura necessária seja replicada instantaneamente com as permissões apropriadas.
          </p>

          <ol className="list-decimal list-inside space-y-2.5 pl-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li>
              Acesse a aba <strong>Criar Nova Pasta</strong> no menu lateral do aplicativo.
            </li>
            <li>
              Selecione a <strong>empresa</strong> correspondente à operação.
            </li>
            <li>
              No campo <em>Nome da Nova Pasta</em>, digite o nome desejado para a pasta a ser criada (Exemplo ilustrativo: <span className="font-mono text-teams-600 dark:text-teams-400 font-semibold">0001 - CLIENTE EXEMPLO LTDA</span>).
            </li>
            <li>
              Clique no botão <strong>Criar Nova Pasta</strong>.
            </li>
            <li>
              O sistema criará automaticamente a estrutura corporativa padronizada copiando o modelo de pastas criado no Active Directory para o diretório de destino.
            </li>
            <li>
              Uma notificação de confirmação em verde indicará a conclusão com sucesso da operação.
            </li>
          </ol>

          {/* Replicação da Estrutura Modelo Corporativa */}
          <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <Layers className="w-4 h-4 text-teams-600 dark:text-teams-400" />
              <span>Replicação Automática do Modelo de Pastas</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              O sistema copia o modelo de pastas criado no Active Directory para o diretório de destino selecionado, garantindo organização, herança e permissões de segurança apropriadas sem necessidade de configuração manual.
            </p>
          </div>
        </section>

        {/* Seção 2: Como Mover Pastas entre Diretórios */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <FolderOutput className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Como Mover Pastas entre Diretórios
            </h4>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            A ferramenta de transferência permite remanejar pastas inteiras com alta velocidade e verificação contínua de integridade entre os diretórios autorizados.
          </p>

          <ol className="list-decimal list-inside space-y-2.5 pl-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li>
              Acesse a aba <strong>Mover Pastas</strong> no menu lateral.
            </li>
            <li>
              Selecione a <strong>empresa</strong> correspondente.
            </li>
            <li>
              <strong>Para onde vai a pasta?</strong>: Selecione o diretório de destino desejado através dos botões de atalho rápido ou selecione outro diretório autorizado.
            </li>
            <li>
              <strong>Onde está a pasta?</strong>: Localize a pasta desejada no painel de listagem. Utilize o campo <em>Pesquisar pasta...</em> digitando parte do nome.
            </li>
            <li>
              Marque as caixas de seleção das pastas que deseja transferir. Para selecionar todos os itens exibidos, clique em <strong>SELECIONAR TODAS</strong>.
            </li>
            <li>
              Clique no botão <strong>Iniciar Transferência</strong>. Uma janela com o progresso em tempo real acompanhará a transmissão segura.
            </li>
            <li>
              Ao término da cópia, o sistema questionará se deseja manter os arquivos na pasta de origem ou removê-los com segurança para liberar espaço.
            </li>
          </ol>
        </section>

        {/* Seção 3: Como Renomear uma Pasta */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              3. Como Renomear uma Pasta
            </h4>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            O módulo de renomeação permite atualizar a nomenclatura de pastas existentes no diretório corporativo de forma direta, prevenindo duplicidades e caracteres inválidos.
          </p>

          <ol className="list-decimal list-inside space-y-2.5 pl-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li>
              Acesse a aba <strong>Renomear Pasta</strong> no menu lateral.
            </li>
            <li>
              Selecione a <strong>empresa</strong> desejada para carregar as pastas autorizadas do ambiente.
            </li>
            <li>
              Localize a pasta que deseja alterar utilizando a lista ou o campo de busca <em>Pesquisar pasta...</em>.
            </li>
            <li>
              Clique sobre a pasta desejada para selecioná-la. O nome atual será carregado automaticamente no campo de edição.
            </li>
            <li>
              Digite o <strong>Novo Nome da Pasta</strong>. O sistema valida instantaneamente a compatibilidade e a inexistência de conflitos de nome.
            </li>
            <li>
              Clique em <strong>Confirmar e Renomear</strong>. A alteração será processada no diretório e registrada no histórico.
            </li>
          </ol>
        </section>

        {/* Seção 4: Acompanhamento de Operações (Histórico) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <History className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              4. Acompanhamento de Operações (Histórico)
            </h4>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Na aba <strong>Histórico</strong> do menu lateral, os operadores podem consultar o registro permanente das operações executadas no sistema. Cada registro armazena:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Data & Hora</div>
              <div className="font-semibold text-xs text-slate-700 dark:text-slate-300 mt-0.5">Momento exato</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Pasta Criada</div>
              <div className="font-semibold text-xs text-slate-700 dark:text-slate-300 mt-0.5">Nome da pasta</div>
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

        {/* Seção 5: Registro de Atividades e Logs (Equipe Técnica & TI) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              5. Registro de Atividades e Telemetria (Equipe Técnica & TI)
            </h4>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            O aplicativo dispõe de um módulo de auditoria e telemetria para diagnóstico operacional, transferências de arquivos e validação de permissões de diretórios.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Onde encontrar o botão de logs?</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Para manter a interface limpa e focada na produtividade, o botão de acesso aos logs fica posicionado discretamente no <strong>canto inferior direito da tela</strong> (<span className="font-mono text-xs font-bold text-teams-600 dark:text-teams-400">REGISTRO TI</span>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Acesso Privado e Protegido por Credencial</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Ao clicar no botão, uma tela de segurança solicitará a credencial técnica de suporte. Isso impede acesso não autorizado a dados técnicos e diagnósticos de infraestrutura.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-2.5">
            <div className="text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-teams-600 dark:text-teams-400" />
              <span>Recursos Disponíveis no Painel de Registro de Atividades:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 pl-1 leading-relaxed">
              <li><strong>Telemetria em Tempo Real</strong>: Acompanhe as etapas de varredura, chamadas de sistema e taxa de transferência de arquivos.</li>
              <li><strong>Categorização por Cores</strong>: Mensagens de sucesso são destacadas em verde, avisos em amarelo e eventuais falhas em vermelho.</li>
              <li><strong>Limpeza de Histórico</strong>: Botão para resetar o buffer de exibição da sessão de trabalho.</li>
              <li><strong>Exportação em Arquivo (.txt)</strong>: Opção para abrir o relatório de eventos no editor padrão do Windows para anexar em chamados ou auditorias técnicas.</li>
              <li><strong>Bloqueio Imediato</strong>: Botão para fechar e travar a sessão de TI logo após a inspeção.</li>
            </ul>
          </div>
        </section>

        {/* Seção 6: Dúvidas Frequentes & Boas Práticas */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              6. Dúvidas Frequentes & Boas Práticas
            </h4>
          </div>

          <div className="space-y-3 font-sans">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span>O que acontece se a pasta já existir no destino?</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                O aplicativo realiza uma pré-verificação antes da criação ou transferência. Se já houver um diretório com o mesmo nome no destino, o sistema emitirá um alerta explícito para prevenir sobreposições ou perdas acidentais de dados.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Por que não se deve fechar o aplicativo durante a transferência?</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Durante a cópia, o aplicativo ativa uma camada de proteção visual que bloqueia o fechamento acidental da janela (incluindo atalhos como Alt+F4). Isso assegura que o fluxo de transferência de arquivos seja concluído integralmente sem interrupções.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teams-600 dark:text-teams-400" />
                <span>Perímetro de Segurança e Governança Corporativa</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                O aplicativo respeita as permissões do sistema operacional e do Active Directory. Destinos fora dos limites autorizados não são acessíveis, assegurando total governança dos arquivos corporativos.
              </div>
            </div>
          </div>
        </section>

        {/* Seção 7: Histórico de Versões do Aplicativo */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              7. Histórico de Versões do Aplicativo
            </h4>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Linha do tempo de evolução técnica e atualizações contínuas do Entropy FolderWorks:
          </p>

          <div className="relative border-l-2 border-slate-200 dark:border-neutral-800 ml-3.5 pl-6 space-y-6 pt-2">
            {/* v2.8.3 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-teams-600 border-2 border-white dark:border-neutral-900" />
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-teams-600 dark:text-teams-400">v2.8.3</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold">Atual</span>
              </div>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Eliminação de Delays de Rede, Exclusão Ultrarrápida e Movimentação Sub-segundo</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Remoção definitiva de chamadas lentas de WNet/IPC$ e WNetCancelConnection2, eliminando o atraso de 54s em pastas vazias. Implementação de exclusão nativa com rmdir /s /q sob credenciais AD e Robocopy otimizado (/MT:16 /COPY:DAT /DCOPY:DAT), transferindo e excluindo em menos de 1 segundo.
              </p>
            </div>

            {/* v2.8.2 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.8.2</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Exclusão Instantânea via Robocopy /MIR e Cópia Otimizada</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Purga paralela multithread de arquivos da origem pós-cópia, eliminando retenção de arquivos Read-Only e resolvendo o problema de múltiplos cliques no botão Deu Certo.
              </p>
            </div>

            {/* v2.8.1 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.8.1</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Otimização de Cópia Ultrarrápida, Cache Instantâneo e Inicialização em Tela Cheia</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Remoção da flag SACL (/COPY:DATS para /COPY:DAT) e retries infinitos do Robocopy, acelerando a transferência de pastas. Carregamento instantâneo de diretórios via cache local persistente com revalidação em segundo plano e inicialização obrigatória em modo maximizado.
              </p>
            </div>

            {/* v2.8.0 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.8.0</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Privacidade Visual (Blur) e Bloqueio de Configurações por Senha TI</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Proteção completa dos parâmetros corporativos, caminhos de rede e credenciais de domínio através de máscara visual (blur) e bloqueio de interação, liberados exclusivamente mediante validação da senha do TI.
              </p>
            </div>

            {/* v2.7.9 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.7.9</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Impersonação AD (pasta.paralegal) em Exclusão, Desfazer e Renomeação</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Execução nativa de exclusão de pasta de origem pós-cópia, rollback e renomeação de diretórios de rede estritamente sob as credenciais corporativas do Active Directory configuradas nas variáveis de ambiente.
              </p>
            </div>

            {/* v2.7.8 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.7.8</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Padronização Global de Larguras e Dimensões de Layout</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Uniformização da largura de todas as telas e caixas principais para o padrão max-w-7xl, alinhando a tela de criação com as de transferência e renomeação. Harmonização de cantos e espaçamentos dos cards.
              </p>
            </div>

            {/* v2.7.7 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.7.7</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Limpeza Completa de Duplicações Visuais e Refinamento de UI</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Correção de duplicações no menu lateral, cabeçalho de versões, título de criação e seções do manual. Interface 100% limpa, consistente e polida.
              </p>
            </div>

            {/* v2.7.6 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.7.6</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Padronização Global, Sanitização e Novo Manual</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Nomenclaturas unificadas e genéricas em todas as telas, remoção de referências específicas de rede na interface, inclusão do guia operacional para renomear pastas e linha do tempo de versões integrada ao manual do usuário.
              </p>
            </div>

            {/* v2.7.5 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.7.5</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Módulo de Renomeação de Pastas</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Adição da funcionalidade de renomeação de diretórios corporativos com busca instantânea e validação automática de duplicidade de nomes.
              </p>
            </div>

            {/* v2.7.0 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.7.0</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Filtragem de Permissões Efetivas do Active Directory</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Aprimoramento do mecanismo de listagem para exibir apenas diretórios onde a credencial de serviço possui permissão de leitura ativa.
              </p>
            </div>

            {/* v2.6.0 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.6.0</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Painel de Telemetria e Diagnóstico Técnico (TI)</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Integração do módulo protegido de logs técnicos em tempo real para auditoria de operações e diagnóstico avançado de rede.
              </p>
            </div>

            {/* v2.5.0 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.5.0</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Redesign Moderno no Padrão Teams / Fluent</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Nova identidade visual com suporte a Modo Claro e Modo Escuro nativos, sincronização automática com o sistema operacional e paleta corporativa.
              </p>
            </div>

            {/* v2.0.0 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.0.0</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Arquitetura Corporativa e Múltiplos Ambientes</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Evolução da arquitetura para suportar múltiplos ambientes organizacionais, gerenciamento de transferências de arquivos e registro central de histórico.
              </p>
            </div>

            {/* v1.0.0 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v1.0.0</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Lançamento Inicial</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Versão base para criação rápida e automatizada de árvores de diretórios a partir de modelos pré-definidos.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
