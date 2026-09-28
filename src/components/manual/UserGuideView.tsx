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
        {/* Seção 1: Como Criar Pastas */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-1.5 rounded-lg bg-teams-50 dark:bg-teams-950/80 text-teams-600 dark:text-teams-400">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Como Criar Pastas
            </h4>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            O módulo de criação padroniza a abertura de diretórios no ambiente corporativo, assegurando que a estrutura necessária seja replicada instantaneamente com as permissões apropriadas.
          </p>

          <ol className="list-decimal list-inside space-y-2.5 pl-2 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li>
              Acesse a aba <strong>Criar Pasta</strong> no menu lateral do aplicativo.
            </li>
            <li>
              Selecione a <strong>empresa</strong> correspondente à operação.
            </li>
            <li>
              No campo <em>Nome da Pasta</em>, digite o nome desejado para a pasta a ser criada (Exemplo ilustrativo: <span className="font-mono text-teams-600 dark:text-teams-400 font-semibold">0001 - CLIENTE EXEMPLO LTDA</span>).
            </li>
            <li>
              Clique no botão <strong>Criar Pasta</strong>.
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
              <li><strong>Limpeza de Histórico Protegida</strong>: Confirmação protegida pela senha do TI para evitar exclusões acidentais da trilha local.</li>
              <li><strong>Armazenamento Duplo e Centralização GPO</strong>: Gravação simultânea na estação local e no arquivo compartilhado corporativo nas pastas GPO (RTO e RELIQUIA), operando 100% via SMB sem necessidade de portas de rede abertas.</li>
              <li><strong>Exportação em Arquivo</strong>: Opção para abrir o relatório de eventos e auditoria no editor padrão do Windows para anexar em chamados ou auditorias técnicas.</li>
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
            {/* v2.9.9 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-teams-600 border-2 border-white dark:border-neutral-900" />
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-teams-600 dark:text-teams-400">v2.9.9</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold">Atual</span>
              </div>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Atalhos Rápidos Livres para o Usuário, Botão Direto na Transferência e Proteção Estrita do TI</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Desvinculação completa da configuração de atalhos rápidos do container com bloqueio e máscara de TI. Seção dedicada e 100% aberta para o usuário adicionar, editar e gerenciar seus próprios atalhos favoritos por empresa com validação imediata de perímetro corporativo. Atalhos criados pelo usuário contam com exclusão instantânea em 1 clique sem requisição de senha, enquanto atalhos definidos pelo TI ('00 - EX CLIENTES' e '01 - EMPRESAS ENCERRADAS') continuam estritamente protegidos por senha de administrador. Adicionado botão direto 'Salvar Destino como Atalho' no módulo Mover Pastas para salvar o destino atual em 1 clique.
              </p>
            </div>

            {/* v2.9.8 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.9.8</span>
              </div>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Criação Múltipla Paralela (+), Toast Escuro, Validação Manual na Transferência e Tema Dinâmico</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Criação de múltiplas pastas simultâneas via botão '+' com paralelismo concorrente Promise.all e Robocopy /MT:128 mantendo DACL oficial. Terceiro botão no modal de transferência para abertura e conferência manual no Explorer. Correção do toast nativo para tema escuro e propagação dinâmica da paleta de 24 cores em 100% dos botões.
              </p>
            </div>

            {/* v2.9.7 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.9.7</span>
              </div>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Auditoria Enriquecida, Buffer Circular FIFO de 500 Registros, Pop-up Toast Windows (10s), Modal Fluent e Atalhos Livres</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Logs de auditoria enriquecidos com máquina física local, operador real do Windows (sem uso da conta de serviço AD como operador), empresa, ação, pasta, status, data/hora, versão da aplicação e cronometragem de duração precisa em todas as rotinas. Buffer circular FIFO automático de 500 registros no arquivo centralizado de rede GPO impedindo sobrecarga via SMB. Limpeza inicial automática (Clean Slate) para que novas builds iniciem com histórico limpo diretamente do repositório da rede. Pop-up Toast moderno estilo Windows 11 com barra regressiva de 10s pós-criação/renomeação, com botões para 'Abrir Pasta' no Explorer e 'Refazer/Desfazer'. Modal corporativo personalizado Fluent Design em substituição aos diálogos genéricos do Windows para bloqueio de perímetro. Auto-bloqueio instantâneo da sessão do TI ao trocar de módulo.
              </p>
            </div>

            {/* v2.9.6 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.9.6</span>
              </div>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Auditoria Centralizada em Pastas GPO Corporativas, Formato Inteligente, Erradicação de Portas e Armazenamento Duplo</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Centralização de logs em pastas compartilhadas GPO da RTO (\\192.168.50.102\gpo\criarpastas_paralegal\LOGS) e RELIQUIA (\\192.168.1.242\gpo\criarpastas_paralegal\LOGS). Detecção inteligente com criação automática de arquivo no formato ideal (.JSON NDJSON) se vazio, preservação absoluta de arquivos de log existentes sem recriação e seletor para o TI em caso de múltiplos arquivos. Erradicação de 100% dos sockets e regras da porta 48899. Configurações de log ocultas para não-administradores, exclusão de histórico local protegida por senha com saída 'X' e manutenção do armazenamento duplo (local + rede).
              </p>
            </div>

            {/* v2.9.5 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.9.5</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Trilha de Auditoria em Arquivo Compartilhado Configurável (.TXT, .MD, .JSON, .YAML)</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Suporte a armazenamento em arquivo compartilhado em 4 formatos estruturados com gravação atômica concorrente multiusuário via SMB, teste de acesso imediato e abertura com um clique.
              </p>
            </div>

            {/* v2.9.4 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.9.4</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Erradicação Total do Mecanismo .trash e Sincronização P2P</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Eliminação definitiva de geração ou renomeação para pastas temporárias .~trash_*, purga via Robocopy /MIR síncrona diretamente no destino e sincronização de eventos entre estações.
              </p>
            </div>

            {/* v2.9.3 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.9.3</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Aplicação Estrita do Perímetro de Segurança de TI em Todos os Módulos</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Algoritmo canônico de validação de limites corporativos em todas as operações de listagem, cópia, renomeação e seleção de pastas, impedindo desvios para áreas não autorizadas.
              </p>
            </div>

            {/* v2.9.2 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.9.2</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Restauração do Modelo Oficial GPO RTO e Otimização Win32</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Retorno ao caminho de modelo oficial da GPO (MODELO) com replicação das permissões departamentais oficiais e disparo direto para o binário Win32 ExecuteAsUser.exe.
              </p>
            </div>

            {/* v2.9.1 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.9.1</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Buffer Circular de Logs e Eliminação de Spam de Listagem</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Remoção de logs periódicos de polling da interface e implementação de rotação automática circular com limite de 120 KB para preservação de disco.
              </p>
            </div>

            {/* v2.9.0 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.9.0</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Auditoria Descentralizada, Rastreamento de Operadores e Correção Gramatical</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Captura e identificação do colaborador responsável por cada ação, histórico corporativo unificado com filtros instantâneos e correção gramatical da interface.
              </p>
            </div>

            {/* v2.8.7 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.8.7</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Correção de Permissões RTO, Limpeza Visual e Auto-Refresh Silencioso (5s)</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Redirecionamento definitivo da origem de modelos da RTO para o template oficial em produção ('EM USO\MODELO 2026'), garantindo 100% de integridade das DACLs departamentais restritas (RH, Paralegal, Fiscal, Contábil, TI) sem vazamento do grupo Todos. Remoção do bloco redundante de confirmação da tela de transferência e implementação de auto-refresh em background a cada 5 segundos nas abas de Mover e Renomear com invalidação automática de cache na criação de novas pastas.
              </p>
            </div>

            {/* v2.8.6 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.8.6</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Restauração de Permissões NTFS DACL (/COPY:DATS) e Aceleração Extrema da RELIQUIA</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Restauração obrigatória da cópia de segurança NTFS (/COPY:DATS /DCOPY:DAT), garantindo a transferência fidedigna das permissões departamentais (CONTABIL, PESSOAL, FISCAL, PARALEGAL, SPED) do modelo para as empresas criadas. Desacoplamento assíncrono da purga da lixeira em DeleteDirectory, reduzindo o tempo de resposta do botão 'Deu certo' para menos de 1 segundo sem travar a interface. Otimização Robocopy com /MT:128 e /IPG:0 sem retries.
              </p>
            </div>

            {/* v2.8.5 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.8.5</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Exclusão Instantânea via Lixeira Oculta (270ms) e Eliminação de Concorrência</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Implementada desvinculação instantânea da pasta original via renomeação atômica para lixeira oculta (272ms no servidor SMB), eliminando erros de arquivos abertos em uso. Remoção definitiva de conflito de processos entre rmdir e Robocopy e cancelamento seguro de processos órfãos via TerminateProcess.
              </p>
            </div>

            {/* v2.8.4 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.8.4</span>
              <h5 className="font-semibold text-slate-900 dark:text-white mt-1">Movimentação Atômica Nativa MFT, Robocopy /MT:128 Máximo e Transferência Paralela Concorrente</h5>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Movimentação atômica instantânea no mesmo volume (Directory.Move / SMB2_SET_INFO), transferindo milhares de arquivos em menos de 2 segundos. Robocopy multithread elevado ao teto máximo de 128 threads (/MT:128) em todas as rotinas. Pool paralelo de transferência para até 5 pastas concorrentes e reversão cirúrgica no botão Desfazer.
              </p>
            </div>

            {/* v2.8.3 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900" />
              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">v2.8.3</span>
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
