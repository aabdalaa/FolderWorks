# Entropy FolderWorks - Histórico de Lançamentos e Versionamento

## Versão 2.9.4 (22/09/2026) - **Erradicação Total do Mecanismo .trash, Liberação Automática de Firewall UDP 48899 e Sincronização P2P Bidirecional**
- **Erradicação Definitiva do Mecanismo de Arquivos e Pastas `.trash`**:
  - Eliminado 100% qualquer geração ou renomeação para pastas temporárias `.~trash_*` no motor nativo `ExecuteAsUser.cs` durante operações de exclusão ou movimentação de diretórios.
  - O motor agora executa a limpeza rápida via Robocopy `/MIR` de um diretório temporário vazio diretamente no caminho de destino (`targetPath`), aguarda a finalização síncrona do processo e em seguida chama `Directory.Delete(targetPath, true)` com fallback Win32 `rmdir /s /q`.
  - Se algum arquivo estiver aberto ou travado por outro usuário na rede, o diretório permanece com seu nome original e retorna mensagem de erro explicativa, sem jamais gerar lixo ou pastas fantasmas no servidor.
  - Limpeza imediata realizada de qualquer pasta órfã remanescente nos servidores RTO e RELIQUIA.
- **Abertura Automática do Windows Firewall para UDP 48899 via Instalador MSI**:
  - Injetadas CustomActions elevadas no instalador WiX (`build_msi.js` e `build_custom_msi.js`) executadas com privilégio `SYSTEM` (`Impersonate="no"` e `Execute="deferred"`).
  - Configura automaticamente regras de entrada e saída no firewall do Windows (`netsh advfirewall firewall add rule name="Entropy FolderWorks P2P UDP" dir=in/out action=allow protocol=UDP localport=48899 profile=any`) em todas as estações sem intervenção do usuário.
  - Implementada também verificação e criação dinâmica em tempo de execução dentro de `electron/main.ts`.
- **Sincronização P2P Bidirecional Ativa e Roteamento para a Sub-rede das Estações (`192.168.80.255`)**:
  - Adicionada a sub-rede física das estações de trabalho (`192.168.80.255`) à lista explícita de broadcast, além de `255.255.255.255`, `192.168.50.255` e `192.168.1.255`.
  - Implementado protocolo de sincronização ativa bidirecional via UDP (`FOLDERWORKS_SYNC_REQUEST` e `FOLDERWORKS_SYNC_RESPONSE`): ao inicializar o app ou consultar a aba de histórico, a máquina solicita os eventos recentes aos computadores vizinhos na rede, garantindo que mesmo estações recém-iniciadas obtenham a trilha de auditoria completa em tempo real.
  - Vinculação do socket UDP a `0.0.0.0` com `reuseAddr: true` para captura irrestrita de pacotes em todas as interfaces.
- **Novo Pacote Oficial MSI v2.9.4**:
  - Compilado via WiX Toolset v3.14 com GUID fixo de atualização in-place (`8f74a92c-561b-4632-9b21-3a218d6e9f10`) e distribuído.

---

## Versão 2.9.3 (22/09/2026) - **Aplicação Estrita do Perímetro de Segurança de TI em Todos os Módulos**
- **Perímetro de Segurança Canônico e Inviolável (`allowedBasePath`)**:
  - Implementado algoritmo canônico de validação de perímetro (`isWithinBoundary`): normaliza os caminhos de rede e barras (`/` e `\`), garantindo que diretórios fora do perímetro configurado pela TI (ex.: acessar `\\192.168.50.102\rto\DEPARTAMENTOS` quando o perímetro é restrito a `\\192.168.50.102\rto\CLIENTES`) sejam estritamente bloqueados.
  - Prevenção contra bypass de correspondência parcial de string (`CLIENTES_SECRET` não corresponde a `CLIENTES`).
- **Bloqueio em Nível de Backend (Electron IPC) em Todas as Operações**:
  - `list-subdirectories`: Bloqueia requisições fora do perímetro e recusa-se a listar conteúdos de pastas restritas, retornando mensagem explícita de segurança de TI.
  - `safe-transfer-copy`: Valida rigorosamente tanto o caminho de origem (`sourcePath`) quanto o de destino (`destParentPath`), além de impedir a transferência do próprio diretório-raiz da empresa.
  - `rename-folder`: Valida o caminho da pasta-alvo e o caminho final renomeado contra o perímetro, impedindo alteração da raiz ou renomeação fora do diretório autorizado.
  - `create-folder`: Valida o caminho final de destino contra o perímetro configurado.
  - `select-directory`: Diálogo nativo do Windows bloqueia a seleção de diretórios fora do perímetro quando invocado com `enforceBoundary: true`, exibindo alerta visual de restrição de TI.
- **Interface com Validação em Tempo Real (Mover e Renomear)**:
  - Módulo **Mover Pastas**: Validação visual imediata do campo de origem (`Onde está a pasta?`). Se o caminho for alterado para fora do perímetro, a borda torna-se vermelha, surge o indicador `Origem Não Permitida`, a grade de pastas é esvaziada e o botão de transferência é desativado.
  - Módulo **Renomear Pastas**: Validação imediata do diretório de trabalho. Se estiver fora do perímetro, exibe alerta visual de perímetro, limpa a listagem de pastas e bloqueia a execução da renomeação.
- **Novo Pacote Oficial MSI v2.9.3**:
  - Compilado via WiX Toolset v3.14 com GUID fixo de atualização in-place (`8f74a92c-561b-4632-9b21-3a218d6e9f10`) e distribuído.

---

## Versão 2.9.2 (22/09/2026) - **Restauração do Modelo Oficial GPO RTO e Otimização da Criação de Pastas**
- **Restauração do Modelo Oficial GPO da RTO (`gpo\criarpastas_paralegal\MODELO`)**:
  - Corrigido o caminho de origem do modelo RTO para apontar estritamente para `\\192.168.50.102\gpo\criarpastas_paralegal\MODELO`.
  - Eliminado o redirecionamento forçado anterior para a pasta `MODELO 2026` em `rto\MODELOS`.
  - Replicadas com 100% de fidelidade as permissões departamentais oficiais (ex.: `EXPEDICAO` contendo unicamente `FISCAL`, `CONTABIL`, `administrativo`, `JURIDICO-CPA`, `Administradores`, `suporte` e `SISTEMA`, sem vazamento para setores indevidos como `PARALEGAL` ou `PESSOAL`).
- **Otimização de Criação e Remoção de Validação Externa**:
  - Removida a validação externa síncrona via PowerShell LDAP que executava consultas no Domain Controller antes da criação.
  - O fluxo de criação dispara diretamente para o executável nativo Win32 `ExecuteAsUser.exe`, reduzindo a latência pré-cópia a zero.
- **Novo Pacote Oficial MSI v2.9.2**:
  - Compilado via WiX Toolset v3.14 com GUID fixo de atualização in-place (`8f74a92c-561b-4632-9b21-3a218d6e9f10`) e distribuído.

---

## Versão 2.9.1 (18/09/2026) - **Comunicação Peer-to-Peer UDP (Porta 48899), Zero Arquivos nos Servidores e Controle Estrito de Logs**
- **Protocolo de Rede P2P UDP Puro (Porta 48899)**:
  - Eliminação definitiva de qualquer gravação de arquivos de auditoria ou logs nos servidores de arquivos (`\\192.168.50.102` e `\\192.168.1.242`). Remoção total do diretório `.folderworks_audit`.
  - Comunicação peer-to-peer direta entre as estações de trabalho através de sockets UDP Broadcast na porta 48899 (`reuseAddr: true` e `setBroadcast(true)`), cobrindo broadcast universal e sub-redes dirigidas (255.255.255.255, 192.168.50.255, 192.168.1.255).
  - O aplicativo transmite e recebe eventos de auditoria silenciosamente pela rede local em milissegundos, mantendo todas as instâncias da equipe sincronizadas em tempo real sem sobrecarregar discos de rede.
- **Eliminação de Spam e Buffer Circular de Logs**:
  - Removidas mensagens de rotina a cada 5 segundos da função `list-subdirectories` (`[LISTAGEM AD] Listando...` e `[LISTAGEM AD] Sucesso:...`), preservando o arquivo `app.log` limpo apenas para operações reais do usuário e erros críticos.
  - Implementado sistema de log rotativo circular com limite de 120 KB ou 1.000 linhas, reduzindo automaticamente para as últimas 500 linhas e prevenindo qualquer inchaço em disco.
- **Interface e Histórico de TI Atualizados**:
  - Badge de telemetria atualizado para `Rede P2P UDP Ativa (Porta 48899)`.
  - Histórico corporativo e modal de auditoria alimentados em tempo real diretamente da memória dos pacotes UDP recebidos.
- **Novo Pacote Oficial MSI v2.9.1**:
  - Compilado via WiX Toolset v3.14 com GUID de atualização in-place (`8f74a92c-561b-4632-9b21-3a218d6e9f10`) e distribuído.

---

## Versão 2.9.0 (17/09/2026) - **Auditoria Descentralizada em Rede (P2P SMB), Rastreamento de Operadores e Correção Gramatical**
- **Histórico e Logs Corporativos Compartilhados em Rede (P2P SMB)**:
  - Implementada arquitetura de auditoria descentralizada sem necessidade de servidor central ou banco de dados externo: os computadores sincronizam suas ações silenciosamente através dos compartilhamentos corporativos já existentes da RTO e RELIQUIA (`.folderworks_audit/events/`).
  - Cada operação realizada (criação, movimentação, renomeação, exclusão de origem, desfeita) gera um arquivo JSON atômico e collision-free (`evt_<timestamp>_<machine>_<random>.json`), eliminando completamente conflitos de concorrência ou bloqueios de arquivo SMB.
  - Se um computador estiver momentaneamente desconectado, o evento é enfileirado localmente em `pending_audit/` e sincronizado automaticamente na rede assim que restabelecida a conectividade.
  - Gravação simultânea de trilha legível de auditoria em `network_activity.log` em cada compartilhamento corporativo.
- **Rastreamento de Identidade do Operador e Telemetria**:
  - Captura automática e silenciosa do usuário do Windows (`process.env.USERNAME` / `os.userInfo().username`), nome da estação/computador (`os.hostname()`), domínio e IP local.
  - As ações agora identificam com clareza o operador responsável (ex.: Franciele, Luana, Julio, David, André Abdala) e a máquina em que a execução ocorreu.
- **Interface de Histórico Corporativo e Logs de TI Modernizada**:
  - Exibição unificada das operações de todas as estações de trabalho com badge indicador de rede sincronizada e identificação visual de cada operador.
  - Auto-refresh em tempo real a cada 5 segundos, com recarga instantânea ao focar a janela ou receber notificações IPC de rede.
  - Filtros instantâneos por Empresa (Todas, RTO, RELIQUIA), por Tipo de Ação e por Colaborador/Operador, além de barra de busca textual completa.
  - Modal de logs de TI atualizado com seletor de abas entre *Log Local* e *Auditoria da Rede*.
- **Correção Gramatical e Remoção de Redundância ("Criar Pasta")**:
  - Removida a redundância gramatical da palavra *"Nova"* em todos os botões, títulos de abas, formulários, menu lateral e manual do usuário (`Criar Nova Pasta` -> `Criar Pasta`).
- **Novo Pacote Oficial MSI v2.9.0**:
  - Compilado via WiX Toolset v3.14 com GUID fixo (`8f74a92c-561b-4632-9b21-3a218d6e9f10`) e distribuído para o repositório de instaladores e Área de Trabalho.

---

## Versão 2.8.7 (15/09/2026) - **Correção Definitiva de Permissões RTO, Limpeza de Interface e Auto-Refresh 5s**
- **Correção e Priorização do Modelo Oficial de Pastas RTO (`EM USO\MODELO 2026`)**:
  - Diagnosticada e corrigida a causa raiz da ausência de permissões departamentais nas pastas criadas na rede da RTO: a configuração apontava anteriormente para `\\192.168.50.102\gpo\criarpastas_paralegal\MODELO`, diretório que possuía o grupo `Todos` herdado e sem permissões departamentais explícitas.
  - Redirecionada a origem para o modelo em produção `\\192.168.50.102\rto\MODELOS\MODELO DE PASTAS\EM USO\MODELO 2026`, que contém 100% das DACLs departamentais restritas (RH `1111`, Paralegal `1112`, Fiscal `1113`, Contábil `1116`, TI `3608`), sem vazamento de privilégios para o grupo `Todos`.
  - Adicionada verificação dinâmica prioritária no handler `create-folder` garantindo a utilização do modelo oficial mesmo em ambientes com arquivos de configuração legados.
- **Ajuste Visual e Limpeza da Tela de Transferência**:
  - Removido integralmente o container estático e redundante *"2. Status e Confirmação da Transferência"* da interface de movimentação de pastas (`FolderTransferView.tsx`), conforme solicitação do usuário.
  - A confirmação e validação do operador ocorrem exclusivamente através do modal centralizado, que fecha e reseta o estado de seleção instantaneamente após a confirmação, exibindo um toast/banner discreto e temporário de sucesso.
- **Auto-Refresh Silencioso a cada 5 Segundos & Invalidação de Cache**:
  - Implementado mecanismo de polling assíncrono silencioso (`silentRefresh`) com intervalo de 5 segundos nas abas de "Mover Pastas" e "Renomear Pastas".
  - O cache em `localStorage` é mantido para tempo de carregamento inicial imediato (0ms), mas a lista é atualizada automaticamente em segundo plano sem perda de seleções ativas e sem exibir spinners bloqueantes.
  - Adicionado gatilho de revalidação imediata no foco da janela (`focus`) e escuta de eventos IPC (`folders-updated`) disparados sempre que uma pasta for criada, transferida, renomeada ou excluída.
  - Invalidação imediata de cache no formulário de criação de pastas (`FolderCreationView.tsx`) logo após a criação bem-sucedida.
- **Novo Pacote Oficial MSI v2.8.7**:
  - Compilado via WiX Toolset v3.14 com GUID fixo (`8f74a92c-561b-4632-9b21-3a218d6e9f10`) e distribuído para a pasta de instaladores e Área de Trabalho.

---

## Versão 2.8.6 (15/09/2026) - **Restauração de Permissões NTFS DACL (/COPY:DATS) e Aceleração Extrema da RELIQUIA**
- **Restauração Mandatória de Segurança NTFS DACL (`/COPY:DATS /DCOPY:DAT`)**:
  - Reintegrada a flag de segurança `S` em todas as rotinas de cópia e transferência com Robocopy (`ExecuteAsUser.cs` e `electron/main.ts`).
  - O Robocopy agora transfere integralmente as listas de controle de acesso discricionárias (DACLs) explícitas de cada departamento (`CONTABILIDADE` -> `RELIQUIA\CONTABIL`, `DP` -> `RELIQUIA\PESSOAL`, `EXPEDICAO` -> `RELIQUIA\FISCAL` / `CONTABIL` / `ADMINISTRAÇÃO`, `FISCAL` -> `RELIQUIA\FISCAL`, `PARALEGAL` -> `RELIQUIA\PARALEGAL`, `SPED` -> `RELIQUIA\FISCAL` / `CONTABIL`), garantindo que os colaboradores de cada setor mantenham seus privilégios corretos de acesso.
- **Desacoplamento Assíncrono da Lixeira no Botão "Deu certo"**:
  - Em `DeleteDirectory`, uma vez que a pasta de origem é atomicamente renomeada para a lixeira oculta (`.~trash_...`) em **270 milissegundos**, o método imediatamente desanexa o processo de purga em segundo plano e retorna sucesso à interface.
  - O modal de confirmação fecha instantaneamente no primeiro clique (sub-segundo), eliminando esperas síncronas de 60 segundos enquanto o servidor limpa milhares de arquivos.
- **Otimização Extrema de Rede para Servidores SMB com Alta Densidade (RELIQUIA)**:
  - Adicionada a flag `/IPG:0` (Inter-Packet Gap = 0) e supressão de retries (`/R:0 /W:0`), permitindo que as 4.413 pastas do modelo da RELIQUIA sejam criadas em 23 segundos com ExitCode 0 absoluto.
- **Novo Pacote Oficial MSI v2.8.6**:
  - Compilado via WiX Toolset v3.14 com GUID fixo (`8f74a92c-561b-4632-9b21-3a218d6e9f10`) e disponibilizado na Área de Trabalho e repositório de instaladores.

---

## Versão 2.8.5 (15/09/2026) - **Exclusão Instantânea via Lixeira Oculta (270ms) e Eliminação de Concorrência**
- **Eliminação Definitiva do Erro de Arquivos Abertos em Uso na Exclusão**:
  - Diagnosticada e corrigida a causa raiz da falha em exclusão de pastas com milhares de itens: o processo mono-thread `rmdir /s /q` sofria timeout de 60s em redes SMB e permanecia executando em segundo plano, colidindo com a purga Robocopy que era disparada logo em seguida sobre os mesmos arquivos.
  - Removida a concorrência prévia de `rmdir`, eliminando 100% dos bloqueios de compartilhamento (`ERROR 32 / sharing violation`).
- **Desvinculação Atômica Imediata para Lixeira Oculta (`.~trash_...`)**:
  - Implementada a renomeação atômica instantânea para pasta oculta no mesmo compartilhamento SMB (`Directory.Move`). Em teste em tempo real na rede da RELIQUIA, a pasta de **4.413 itens** foi liberada em **272 milissegundos**, sumindo imediatamente da rede e permitindo conclusão imediata para o operador.
  - A pasta oculta de lixeira é purgada de forma limpa pelo Robocopy `/MIR /MT:128` com 128 threads paralelas.
- **Cancelamento Forçado Seguro (`TerminateProcess`)**:
  - Adicionado encerramento forçado automático via `TerminateProcess` em caso de estouro de timeout de qualquer processo filho do motor nativo C#, impedindo a criação de processos órfãos que segurem travas de arquivos.
- **Novo Pacote Oficial MSI v2.8.5**:
  - Compilado via WiX Toolset v3.14 com GUID fixo (`8f74a92c-561b-4632-9b21-3a218d6e9f10`) e distribuído para Área de Trabalho e repositório de instaladores.

---

## Versão 2.8.4 (15/09/2026) - **Movimentação Atômica Nativa MFT, Robocopy /MT:128 Máximo e Transferência Paralela Concorrente**
- **Movimentação Atômica Nativa MFT / SMB2 (`Directory.Move` / `cmd move`)**:
  - Implementada movimentação atômica em nível de metadados do sistema de arquivos para pastas transferidas dentro do mesmo volume/compartilhamento SMB (`ExecuteAsUser.exe --move`).
  - Pastas geradas a partir do modelo de GPO (contendo **4.413 subpastas e arquivos**) agora são transferidas em apenas **1,9 segundo** (anteriormente 86 segundos via Robocopy através da rede).
  - Em casos de volumes distintos ou destinos entre servidores, o fallback automático para Robocopy `/MT:128` é acionado de forma totalmente transparente.
- **Elevação Global do Robocopy para Multithreading Máximo (`/MT:128`)**:
  - Atualizadas todas as rotinas de Robocopy do sistema (criação de pastas `create-folder`, transferência segura `safe-transfer-copy` e purga de diretórios `/MIR`) para o teto técnico máximo permitido pelo Windows de **128 threads concorrentes** (`/MT:128`).
- **Execução Paralela Concorrente em Lote (Pool de 5 Workers)**:
  - Substituído o loop estritamente sequencial (1 por 1) na interface de transferência de pastas (`FolderTransferView.tsx`) por um pool assíncrono de até 5 workers simultâneos.
  - A transferência de 50 pastas de clientes agora é executada em segundos, eliminando a previsão anterior de mais de 70 minutos.
- **Reversão Cirúrgica e Resiliente no Botão 'Não Deu Certo' (Desfazer)**:
  - Quando a pasta foi movida atomicamente, a ação de desfazer move a pasta de volta do destino para a origem em **255 milissegundos**, preservando 100% dos dados originais.
  - No botão "Deu Certo", como a pasta já foi movida para o destino, a origem é liberada instantaneamente (0ms) no primeiro clique.
- **Novo Pacote Oficial MSI v2.8.4**:
  - Compilado via WiX Toolset v3.14 com GUID fixo (`8f74a92c-561b-4632-9b21-3a218d6e9f10`) e distribuído para Área de Trabalho e repositório de instaladores.

---

## Versão 2.8.3 (15/09/2026) - **Eliminação de Delays de Rede, Exclusão Ultrarrápida e Movimentação Sub-segundo**
- **Eliminação Definitiva do Gargalo de 54s em Movimentação de Pastas**:
  - Removido completamente o método obsoleto `ConnectServer` (`WNetAddConnection2` e `WNetCancelConnection2`) de `ExecuteAsUser.cs`. O Windows retornava erro `1219` (conflito de credenciais com compartilhamentos existentes) e forçava encerramento de conexões de rede ativas com timeout de até 50 segundos. O `CreateProcessWithLogonW` já fornece autenticação de rede 100% isolada e imediata via `LOGON_NETCREDENTIALS_ONLY`.
  - Eliminadas chamadas síncronas `fs.existsSync` e `fs.mkdirSync` em caminhos de rede UNC no processo principal do Node.js, prevenindo bloqueio do event loop sob a conta local da máquina.
- **Otimização Crítica do Robocopy**:
  - Removidas as flags `/J` (inadequada para pastas vazias/pequenas pois desabilita cache de arquivos do sistema operacional) e `/COMPRESS` (que gerava tentativas de negociação de SMB Compression em servidores não compatíveis).
  - Padronizadas as flags para: `/E /COPY:DAT /DCOPY:DAT /MT:16 /R:0 /W:0 /NFL /NDL /NJH /NJS /nc /ns /np`. Tempo de cópia de pasta vazia reduzido de **54 segundos para 448 milissegundos**.
- **Exclusão Instantânea via `rmdir /s /q` Sob Credenciais AD (278ms)**:
  - Implementada exclusão direta imediata via `cmd.exe /c rmdir /s /q` sob o token de rede de `pasta.paralegal`, concluindo a exclusão em **278 milissegundos** no primeiro clique do botão "Deu Certo", com fallback resiliente para purga Robocopy `/MIR /MT:16 /R:0 /W:0` caso arquivos estejam protegidos.
- **Parser Resiliente de JSON IPC**:
  - Adicionada captura robusta por expressão regular (`/\{[\s\S]*\}/`) em `executeNativeOperation` para garantir interpretação imediata das respostas do motor nativo.
- **Novo Pacote Oficial MSI v2.8.3**:
  - Compilado via WiX Toolset v3.14 e sincronizado para a Área de Trabalho e repositório de instaladores.

---

## Versão 2.8.2 (14/09/2026) - **Exclusão Instantânea via Robocopy /MIR, Resolução de Múltiplos Cliques e Cópia Acelerada**
- **Exclusão Instantânea via Purge Multithread Robocopy /MIR (100-300ms)**:
  - Substituída a rotina de exclusão sequencial mono-thread por espelhamento reverso de pasta vazia temporária (`robocopy /MIR /MT:32 /R:0 /W:0`), purgada em 32 threads paralelas diretamente sob as credenciais AD.
  - Ignorados e eliminados automaticamente quaisquer atributos de somente-leitura (`ReadOnly`) ou arquivos do sistema sem falhas de acesso ou travamentos.
  - Tempo de exclusão reduzido de ~5 minutos para **menos de 1 segundo**.
- **Resolução do Problema de Múltiplos Cliques no Botão 'Deu Certo'**:
  - Eliminado o timeout prematuro de 45 segundos do Node.js (elevado para 180s como margem de segurança).
  - O modal de confirmação agora fecha instantaneamente no **primeiro clique** após a conclusão da purga de todas as pastas selecionadas.
  - Adicionado alerta de feedback diretamente no corpo do modal caso ocorra qualquer imprevisto de rede durante decisões humanas.
- **Aceleração da Cópia de Pastas (Meta de 20 a 30 segundos)**:
  - Adicionados os parâmetros `/MT:32` (32 threads concorrentes), `/J` (E/S direta sem buffer de memória para máxima vazão de rede) e `/COMPRESS` (compactação nativa SMB3) nos pipelines do Robocopy nativo e gerenciado.
- **Novo Pacote Oficial MSI v2.8.2**:
  - Compilado com WiX Toolset v3.14 e distribuído para a Área de Trabalho e repositório de instaladores.

---

## Versão 2.8.1 (14/09/2026) - **Otimização de Cópia Ultrarrápida, Cache Instantâneo de Diretórios e Inicialização em Tela Cheia**
- **Otimização Drástica da Velocidade de Cópia (Eliminação da Espera de 120s)**:
  - Investigado e sanado o gargalo de transferência no Robocopy: a flag `/COPY:DATS` foi ajustada para `/COPY:DAT /DCOPY:DAT`. A flag `S` (Security/NTFS ACLs) gerava falhas constantes de gravação de propriedade e SACL em compartilhamentos SMB corporativos sob contas de serviço, disparando retries cumulativos que travavam o processo por 120 segundos.
  - Parâmetros de retries do Robocopy ajustados para `/R:0 /W:0 /MT:8`, eliminando qualquer atraso de rede desnecessário na cópia.
  - Otimizada a rotina `RemoveAttributesRecursive` e o tratamento de sessões SMB em `ExecuteAsUser.cs` para evitar varreduras recursivas lentas pela rede.
  - A validação interativa humana de sucesso/desfazer permanece rápida e sob o controle do usuário nos botões verde e vermelho.
- **Abertura Obrigatória em Tela Cheia (Maximizada)**:
  - Configurado `mainWindow.maximize()` no ciclo de inicialização do Electron, garantindo que o aplicativo sempre abra ocupando toda a tela, preservando a liberdade do usuário para redimensionar ou restaurar quando desejar.
- **Cache Instantâneo de Pastas (Stale-While-Revalidate)**:
  - Implementado sistema de cache local persistente (`localStorage`) nas telas de *Mover Pastas* e *Renomear Pastas*, eliminando a tela vazia e o spinner de carregamento demorado em aberturas subsequentes.
  - As pastas em cache são renderizadas instantaneamente (0ms), enquanto uma sincronização silenciosa em segundo plano atualiza novas pastas do compartilhamento corporativo.
  - Atualização instantânea do cache e da grade ao confirmar exclusão ou renomeação de pastas.
- **Novo Pacote Oficial MSI v2.8.1**:
  - Compilado com WiX Toolset v3.14 e distribuído para a Área de Trabalho e repositório de instaladores.

---

## Versão 2.8.0 (14/09/2026) - **Privacidade Visual (Blur) e Proteção de Configurações por Senha TI**
- **Privacidade Visual e Proteção nas Configurações Corporativas**:
  - Implementado efeito de desfoque visual (`filter: blur(8px)` / `blur-md`), opacidade reduzida e desativação total de interação (`select-none pointer-events-none`) em todos os campos, caminhos UNC, IPs e credenciais da tela de Configurações para usuários comuns.
  - Adicionado card central de segurança com o status *Acesso Restrito ao TI*, mensagem explicativa e botão de ação direta para desbloquear com a senha do TI.
  - Liberação imediata e fluida de todos os parâmetros e recursos de edição após a autenticação bem-sucedida da senha do TI.
  - Proteção estendida ao botão *Testar Conexão*, que agora solicita a autenticação prévia caso o usuário ainda não esteja autenticado.
  - Botão *Bloquear* no cabeçalho permite restaurar a proteção e o desfoque instantaneamente com um clique.
- **Virada de Versão no Padrão Semantic Versioning (SemVer)**:
  - Promoção da versão para **v2.8.0** (incremento MINOR) refletindo a nova camada de segurança e governança visual no aplicativo.
  - Sincronização uniforme em todo o ecossistema: `package.json`, cabeçalhos visuais, scripts de build WiX, linha do tempo do manual do usuário e documentação técnica.
- **Novo Pacote Oficial MSI v2.8.0**:
  - Compilado com WiX Toolset v3.14 e distribuído na Área de Trabalho e repositórios locais com suporte a atualização *in-place*.

---

## Versão 2.7.9 (14/09/2026) - **Impersonação Corporativa AD (pasta.paralegal) em Exclusão, Rollback e Renomeação**
- **Execução Nativa sob Credenciais do Active Directory**:
  - Motor `ExecuteAsUser.exe` expandido com os comandos `--delete` e `--rename`, permitindo manipular arquivos e diretórios em compartilhamentos de rede UNC sob o token de segurança corporativo configurado (`pasta.paralegal`).
  - Atualizado o handler `delete-source-folders`: a exclusão da pasta de origem após mover pastas agora roda autenticada via `ExecuteAsUser.exe --delete`, eliminando bloqueios por falta de privilégio do usuário local do Windows.
  - Atualizado o handler `undo-transfer`: a reversão (rollback) de cópias no destino agora roda via `ExecuteAsUser.exe --delete` sob `pasta.paralegal`.
  - Atualizado o handler `rename-folder`: a renomeação de diretórios corporativos de rede agora roda via `ExecuteAsUser.exe --rename` sob `pasta.paralegal`.
  - Remoção automática preventiva de atributos `ReadOnly` antes de exclusões para prevenir falhas de acesso nativas do Windows.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Versão atualizada uniformemente para **v2.7.9** em todo o código-fonte, scripts WiX e documentação técnica.
- **Novo Pacote Oficial MSI v2.7.9**:
  - Compilado com WiX Toolset v3.14 e disponibilizado na Área de Trabalho e repositórios locais.

---

## Versão 2.7.8 (14/09/2026) - **Padronização Global de Larguras e Dimensões de Layout**
- **Padronização de Largura de Telas e Containers (`max-w-7xl mx-auto`)**:
  - Container da tela **Criar Nova Pasta** (`FolderCreationView.tsx`) expandido de `max-w-3xl` para `max-w-7xl`, alinhando sua largura perfeitamente às telas de **Mover Pastas** e **Renomear Pasta**.
  - Harmonização de estilos do card principal de criação para `rounded-xl`, `p-6` e ícone `w-9 h-9`, garantindo consonância total com o design system do projeto.
  - Telas de **Histórico** (`HistoryView.tsx`), **Configurações** (`SettingsView.tsx`) e **Manual do Usuário** (`UserGuideView.tsx`) padronizadas para `max-w-7xl mx-auto`, eliminando saltos de largura ao navegar entre abas.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Versão atualizada uniformemente para **v2.7.8** em todo o código-fonte, scripts WiX e documentação técnica.
- **Novo Pacote Oficial MSI v2.7.8**:
  - Compilado com WiX Toolset v3.14 e disponibilizado na Área de Trabalho e repositórios locais.

---

## Versão 2.7.7 (11/09/2026) - **Limpeza Completa de Duplicações Visuais e Refinamento de UI**
- **Eliminação Integral de Duplicações Visuais na Interface**:
  - Removido o item residual `Criar Pastas` na barra lateral, mantendo unicamente `Criar Nova Pasta`.
  - Corrigido o título sobreposto em `FolderCreationView.tsx`, mantendo estritamente o título `Criar Nova Pasta`.
  - Eliminada a exibição simultânea de `v2.7.5` e `v2.7.6` nas badges de versão (`TitleBar.tsx`, `Header.tsx`, `AboutView.tsx`), sincronizando todas as referências para `v2.7.7`.
  - Removidos rótulos, dicas e botões duplicados em `FolderCreationView.tsx`, `FolderRenameView.tsx`, `FolderTransferView.tsx` e `HistoryView.tsx`.
  - Reescrita limpa e sem redundâncias de todas as seções e passos do manual operacional (`UserGuideView.tsx`).
- **Sincronização de Metadados e Versionamento SemVer**:
  - Versão atualizada uniformemente para **v2.7.7** em todo o código-fonte, scripts WiX e documentação técnica.
- **Novo Pacote Oficial MSI v2.7.7**:
  - Compilado via WiX Toolset v3.14 e disponibilizado na Área de Trabalho e repositórios locais.

---

## Versão 2.7.6 (11/09/2026) - **Padronização Global, Sanitização de Vocabulário e Atualização Completa do Manual**
- **Padronização Global e Sanitização de Vocabulário na Interface**:
  - Remoção de referências a "cliente" e nomes de setores internos nos textos voltados ao usuário: a ferramenta atua puramente como um gerenciador e criador corporativo de diretórios.
  - Aba lateral e tela inicial renomeadas para **Criar Nova Pasta**.
  - Seletor de empresas ajustado para **Selecione a Empresa**, com subtítulo limpo **Estrutura Corporativa** (remoção de endereços IP da interface).
  - Campos de busca textual unificados com o placeholder `Pesquisar pasta...`.
  - Coluna do histórico renomeada para `Pasta Criada`.
- **Manual do Usuário Expandido com Renomeação e Histórico de Versões**:
  - Inclusão da seção operacional detalhada para o módulo **Como Renomear uma Pasta**.
  - Revisão de todos os textos operacionais para uma linguagem corporativa limpa, instrutiva e acessível.
  - Inclusão de linha do tempo com histórico de versões técnicas do aplicativo diretamente no manual interno (`UserGuideView.tsx`) e na documentação (`06-MANUAL_DO_USUARIO.md`).
- **Sincronização de Metadados e Versionamento SemVer**:
  - Versão atualizada uniformemente para **v2.7.6** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts WiX (`build_msi.js`, `build_custom_msi.js`).
  - Geração de pacote MSI mantida em espera conforme solicitação do usuário.

---

## Versão 2.7.5 (11/09/2026) - **Governança AD/NTFS de Pastas Administrativas, Ocultação no Explorer e Ajuste na Barra Lateral**
- **Renomeação dos Botões da Barra Lateral (`Sidebar.tsx`)**:
  - `Mover / Transferir Pastas` → `Mover Pastas`
  - `Histórico & Auditoria` → `Histórico`
  - `Manual & Diagnóstico` → `Manual de Uso`
  - Interface mais limpa, direta e humanizada de acordo com as diretrizes de UX/UI da ENTROPY.
- **Governança Active Directory / NTFS de Pastas Administrativas**:
  - Aplicada regra NTFS de negação estrita (`Deny | FullControl`) para a conta de serviço `pasta.paralegal` em todas as pastas administrativas (`_000-CHECK-LIST MENSAL`, `_ATA de REUNIOES`, `_CONTROLES DAS EMPRESAS`, `_LEIA-ME`, `_MODELOS DE DOCUMENTOS`) no servidor RTO, igualando a política de segurança já vigente no servidor RELIQUIA.
  - Zero uso de expressões regulares ou filtros por código de cliente: a restrição opera 100% via permissões nativas de segurança do AD e DACL NTFS sob o token do usuário.
- **Ocultação de Pastas no Windows Explorer (`Hidden`)**:
  - Aplicado o atributo de sistema `Hidden` (`attrib +h`) em todas as pastas administrativas dos servidores de arquivos (RTO e RELIQUIA). Com isso, o Windows Explorer e as caixas de diálogo nativas de seleção de pastas omitem automaticamente essas pastas para todos os usuários comuns.
- **Aprimoramento do Motor C# Nativo (`ExecuteAsUser.cs`)**:
  - Adicionada verificação explícita do atributo `FileAttributes.Hidden` na função `ListDirectories`.
  - Reforçado o bloqueio por exceção de segurança (`UnauthorizedAccessException`), garantindo que pastas sem autorização nunca cheguem à interface.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Versão atualizada uniformemente para **v2.7.5** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts WiX (`build_msi.js`, `build_custom_msi.js`).
- **Novo Pacote Oficial MSI v2.7.5**: Compilado com WiX Toolset v3.14.

---

## Versão 2.7.4 (11/09/2026) - **Grade Interativa de Listagem e Pesquisa de Pastas em "Renomear Pasta"**
- **Listagem e Pesquisa de Pastas Integrada à Tela de Renomear**:
  - Incorporada a mesma experiência da tela de *Transferência*: carregamento automático das pastas do servidor de arquivos da empresa selecionada (RTO, RELIQUIA, etc.).
  - Campo de busca rápida em tempo real para pesquisar cliente por código ou nome (`Pesquisar cliente por código ou nome...`).
  - Grade visual com ícones representativos (`FolderOpen`), nomes de pastas, datas de modificação e indicador de seleção ativa.
  - Seleção com um clique: ao clicar em qualquer pasta da lista, o caminho completo é configurado, o nome atual é exibido e o campo de novo nome é preenchido instantaneamente para permitir edição rápida e sem digitação manual de caminhos.
  - Recarregamento automático: logo após a conclusão da renomeação, a lista de pastas do servidor é atualizada instantaneamente para refletir a nova nomenclatura em tempo real.
  - Botão alternativo "Outro Diretório..." mantido para casos especiais em que o operador precise renomear um diretório fora da estrutura padrão.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Versão atualizada uniformemente para **v2.7.4** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts WiX (`build_msi.js`, `build_custom_msi.js`).
- **Novo Pacote Oficial MSI v2.7.4**: Compilado com WiX Toolset v3.14.

---

## Versão 2.7.3 (11/09/2026) - **Harmonização do Seletor de Empresas em Renomear Pastas e Generalização de Descrições (Zero Vazamento de Dados)**
- **Harmonização Visual da Interface de Renomear Pastas**:
  - Alinhado o seletor de empresas da aba *Renomear Pasta* com a mesma disposição e padrão visual da tela de *Transferência de Pastas*: barra superior destacada com o rótulo `Empresa:` e botões segmentados com ícone predial `Building2`.
  - Layout unificado com container de largura estendida `max-w-7xl` e estilo corporativo consistente em todo o aplicativo.
- **Generalização de Descrições e Eliminação de Vazamento de Dados Internos**:
  - Atualizada a descrição da criação de pastas para *"Copia o modelo de pastas criado no AD para o diretório de destino"*, tornando a comunicação concisa, clara e totalmente agnóstica de ambiente.
  - Removidas menções a quantidades de subpastas ou nomes de departamentos específicos em `UserGuideView.tsx` e `06-MANUAL_DO_USUARIO.md`, substituindo por seções sobre replicação automatizada de modelos e herança de segurança institucional do Active Directory.
  - O aplicativo agora opera como uma solução 100% genérica e comercial, pronta para distribuição pública e implantação em qualquer infraestrutura corporativa sem expor estruturas internas.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Versão atualizada uniformemente para **v2.7.3** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts WiX (`build_msi.js`, `build_custom_msi.js`).
- **Novo Pacote Oficial MSI v2.7.3**: Compilado com WiX Toolset v3.14.

---

## Versão 2.7.2 (11/09/2026) - **Correção da Validação de Conexão AD e Status dos Servidores via -EncodedCommand**
- **Correção Crítica no Mecanismo de Teste de Conexão e Status dos Servidores**:
  - Eliminado erro onde scripts PowerShell com quebras de linha e comentários `#` entravam em colapso ao serem interpolados em linha única no `cmd.exe`, gerando saída vazia e indicando falsamente que servidores ativos estavam offline.
  - Implementada execução blindada via `execFile('powershell.exe', ...)` utilizando `-EncodedCommand` com codificação Base64 UTF-16LE, imune a problemas de escape, aspas ou caracteres especiais.
  - Adicionado `$ProgressPreference = 'SilentlyContinue'` para suprimir transmissões indesejadas de progresso CLIXML no fluxo de erro do PowerShell.
  - Integrada decodificação defensiva `decodeProcessOutput` para preservar acentos do português em mensagens de erro e alertas de domínio.
  - O "Status dos Servidores" e o botão "Testar Conexão" agora refletem com 100% de fidelidade o estado real da rede: **Verde** para servidores e credenciais ativas (RELIQUIA e RTO com `pasta.paralegal`) e **Vermelho** com mensagem detalhada do AD caso as credenciais estejam incorretas (ex: `RTO\aaaa`).
- **Sincronização de Metadados e Versionamento SemVer**:
  - Atualização uniforme de versão para **v2.7.2** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts WiX (`build_msi.js`, `build_custom_msi.js`).
- **Novo Pacote Oficial MSI v2.7.2**: Compilado com WiX Toolset v3.14.

---

## Versão 2.7.1 (11/09/2026) - **Encerramento Automático de Instâncias no MSI e Trava de Instância Única**
- **Encerramento Forçado e Silencioso no Instalador MSI (Solução do Diálogo "Files in Use")**:
  - Injetada ação customizada `CAQuietExec` (`taskkill.exe /F /IM FolderWorks.exe /T`) agendada em `InstallUISequence` (antes de `CostInitialize`) e em `InstallExecuteSequence` (antes de `InstallValidate`).
  - Adicionado elemento nativo `<util:CloseApplication Id="CloseFolderWorks" Target="FolderWorks.exe" CloseMessage="yes" TerminateProcess="1" Timeout="3" RebootPrompt="no" />` via `WixUtilExtension`.
  - Elimina em 100% das vezes o diálogo "Files in Use" com múltiplas instâncias reportadas pelo Windows Restart Manager.
  - O aplicativo em execução é fechado de forma automática e transparente antes da substituição de arquivos, garantindo que o usuário nunca continue rodando uma versão desatualizada após o processo de upgrade.
- **Trava de Instância Única no Electron (`requestSingleInstanceLock`)**:
  - Implementado `app.requestSingleInstanceLock()` no processo principal do Electron (`electron/main.ts`).
  - Tentativas adicionais de abertura pelo usuário redirecionam e focam a janela existente (`second-instance`), impedindo a criação de instâncias zumbis ou duplicadas.
  - Definido título explícito de janela (`title: 'FolderWorks'`) para identificação imediata pelos gerenciadores de processo do sistema operacional.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Atualização uniforme de versão para **v2.7.1** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts WiX (`build_msi.js`, `build_custom_msi.js`).
- **Novo Pacote Oficial MSI v2.7.1**: Compilado com WiX Toolset v3.14 mantendo UpgradeCode in-place idêntico.

---

## Versão 2.7.0 (11/09/2026) - **Módulo de Renomeação de Pastas, Validação Real AD e Proteção Crítica de Credenciais**
- **Nova Funcionalidade: Renomear Pastas Corporativas (`FolderRenameView`)**:
  - Adicionado novo módulo dedicado acessível pela barra lateral ("Renomear Pasta" com ícone `FolderEdit`).
  - Fluxo intuitivo e direto: o operador escolhe uma pasta através do seletor nativo, visualiza o nome atual e informa o novo nome desejado.
  - Sanitização e validação nativa de caracteres proibidos pelo Windows (`\ / : * ? " < > |`) e bloqueio de nomes vazios ou idênticos ao atual.
  - Handler IPC `rename-folder` seguro com registro de auditoria completo (`FOLDER_RENAMED`) contendo caminho de origem, novo caminho e operador.
- **Validação Rigorosa de Conexão no Active Directory (Falso Positivo Eliminado)**:
  - O teste de conectividade agora realiza validação trifásica completa em PowerShell:
    1. Teste de conectividade de rede na porta TCP 445 (SMB);
    2. Autenticação real via LDAP com `System.DirectoryServices.DirectoryEntry` utilizando o usuário e senha configurados;
    3. Pesquisa ativa no catálogo global com `DirectorySearcher` para confirmar existência da conta.
  - Usuários inexistentes (ex: `RTO\aaaa`) ou credenciais incorretas são imediatamente rejeitados com diagnósticos detalhados.
- **Correção de Falha Crítica de Segurança em Configurações**:
  - Em `SettingsView.tsx`, o botão de visualização de senha `(👁)` foi completamente ocultado para usuários não autorizados.
  - O campo de senha não injeta a credencial real no DOM quando bloqueado, exibindo apenas uma máscara estática (`••••••••••••`).
  - Apenas após autenticação mestre do TI com senha de administrador a credencial real torna-se acessível e auditável.
- **Empresa e Usuário Padrão Atualizados para RTO**:
  - O aplicativo inicializa com a empresa **RTO** e o usuário **`RTO\pasta.paralegal`** selecionados por padrão em todos os módulos (Criação, Transferência, Renomeação e Configurações).
- **Sincronização de Metadados e Versionamento SemVer**:
  - Atualização uniforme de versão para **v2.7.0** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts WiX (`build_msi.js`, `build_custom_msi.js`).
- **Novo Pacote Oficial MSI v2.7.0**: Compilado com WiX Toolset v3.14 mantendo UpgradeCode in-place idêntico.

---

## Versão 2.6.2 (11/09/2026) - **Atualização de Variáveis Corporativas Padrão da RELIQUIA e RTO**
- **Atualização de Infraestrutura de Rede da Empresa RELIQUIA**:
  - `sourcePath` (Modelo de Pastas / Origem da Estrutura): Atualizado de `\\192.168.100.30\gpo\criarpastas_paralegal\MODELO` para `\\192.168.1.242\gpo\criarpastas_paralegal\MODELO`.
  - `adServerIp` (Servidor AD / IP ou Host): Atualizado de `192.168.100.30` para `192.168.1.242`.
- **Atualização de Credencial de Domínio da Empresa RTO**:
  - `domainUser` (Usuário de Serviço): Atualizado de `pasta.paralegal` para `RTO\pasta.paralegal` nas configurações padrão e gerador de instaladores.
- **Sincronização em Toda a Infraestrutura de Build e Configuração**:
  - Atualizados `.env`, `main.ts`, `build_msi.js`, `build_custom_msi.js` e `MSIBuilderView.tsx` para assegurar que restaurações de fábrica e novas compilações utilizem os novos parâmetros.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Versão atualizada para **v2.6.2** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts WiX.
- **Novo Pacote Oficial MSI v2.6.2**: Compilado com WiX Toolset v3.14 com UpgradeCode in-place mantido.

---

## Versão 2.6.1 (09/09/2026) - **Correção de Layout das Abas, Simplificação da Interface e Eliminação de Vazamento de Dados**
- **Correção dos Botões e Abas de Empresas no Topo**:
  - Eliminada a renderização duplicada de botões estáticos no seletor de empresas em `SettingsView.tsx`, `FolderTransferView.tsx` e `FolderCreationView.tsx`.
  - Layout das abas corrigido para evitar bordas cortadas, overflow ou scrollbars desnecessárias, proporcionando uma navegação limpa e fluida.
- **Simplificação e Despoluição Visual em Configurações (`SettingsView.tsx`)**:
  - Redução drástica de textos longos, avisos redundantes e parágrafos burocráticos.
  - Interface enxuta, moderna e direta inspirada nos princípios do Microsoft Teams e Fluent Design.
- **Proteção Total contra Vazamento de Dados (Zero Data Leakage)**:
  - Removido qualquer exemplo contendo nomes reais de pastas ou departamentos internos em descrições, campos ou manuais.
  - A explicação do Perímetro de Segurança agora é puramente descritiva: delimita o diretório base autorizado e informa que operações fora deste caminho são bloqueadas automaticamente.
- **Rótulos Amigáveis e Limpos na Transferência (`FolderTransferView.tsx`)**:
  - Removidos títulos duplicados, mantendo exclusivamente as perguntas intuitivas: *"Onde está a pasta?"* e *"Para onde vai a pasta?"*.
  - Mensagem de alerta de destino corrigida para evitar parágrafos redundantes.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Atualização uniforme de versão para **v2.6.1** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts de geração de MSI (`build_msi.js`, `build_custom_msi.js`).
- **Novo Pacote MSI v2.6.1**: Compilado com WiX Toolset v3.14 mantendo compatibilidade in-place upgrade e tamanho enxuto (~111 MB).

---

## Versão 2.6.0 (09/09/2026) - **Desbloqueio TI com Senha, Gestão Dinâmica de Empresas e Perímetro de Governança**
- **Painel de Configurações Protegido por Senha de Administrador TI (`SettingsView.tsx`)**:
  - Acesso à edição de configurações bloqueado por padrão para operadores comuns.
  - Desbloqueio seguro através do modal `TIAccessModal` utilizando a credencial mestre do TI (`Fallima1979` ou variável `TI_LOGS_PASSWORD`).
  - Interface moderna no padrão Microsoft Teams / Fluent Design com indicação visual de status bloqueado/ativo.
- **Gestão Dinâmica de Empresas e Filiais**:
  - Adição de novas empresas/filiais (`+ Nova Empresa`) e remoção com validação de segurança (mínimo de 1 empresa ativa).
  - Configuração granular por empresa: caminhos de rede (`sourcePath`, `destSharePath`), pasta padrão de origem (`defaultSourceFolder`), credenciais de Active Directory (`adServerIp`, `domainUser`, `adPass`).
  - Seletor de diretórios nativo (`selectDirectory`) com botão "Procurar..." integrado aos campos de caminho.
- **Perímetro de Governança de Arquivos Configurável (`allowedBasePath`)**:
  - O perímetro que delimita onde os operadores podem criar e mover pastas agora é 100% configurável pela equipe de TI.
  - Bloqueio rígido de segurança: impede que qualquer operação afete pastas raízes ou diretórios fora do perímetro autorizado.
- **Gerenciador Dinâmico de Atalhos Rápidos (`presetDestinations`)**:
  - Permite ao TI configurar a lista dinâmica de botões de atalho de destino ("Para onde vai a pasta?"), com ações de adicionar, editar e excluir atalhos por empresa.
- **Persistência Inteligente & Restauração de Fábrica (`main.ts`)**:
  - Prioridade para `%APPDATA%/FolderWorks/config.json`, garantindo persistência real das customizações do TI entre reinicializações.
  - Evento IPC reativo `config-updated` propagando atualizações em tempo real para o frontend sem necessidade de reiniciar o aplicativo.
  - Botão "Restaurar Padrões de Fábrica" (`reset-config`) para reverter configurações para o estado original do instalador MSI caso necessário.
- **Arquitetura Dinâmica em Todo o Aplicativo**:
  - `FolderCreationView.tsx`: Grid de criação de pastas adapta-se dinamicamente a todas as empresas cadastradas no `config.json`.
  - `FolderTransferView.tsx`: Seletor dinâmico de empresas com atalhos, perímetros e pastas padrão carregados automaticamente para a empresa ativa.
  - `Sidebar.tsx` & `App.tsx`: Monitoramento e indicação de status de conexão dinâmica para todos os servidores das empresas cadastradas.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Atualização uniforme de versão para **v2.6.0** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts de geração de MSI (`build_msi.js`, `build_custom_msi.js`).
- **Novo Pacote MSI v2.6.0**: Compilado com WiX Toolset v3.14 mantendo compatibilidade in-place upgrade e tamanho enxuto (~111 MB).

---

## Versão 2.5.14 (09/09/2026) - **Correção de Duplicação na Tela Sobre e Botão Minimalista de Informações (i)**
- **Eliminação da Renderização Duplicada (`App.tsx`)**:
  - Corrigido o bug onde o componente `<AboutView />` era instanciado em duplicidade no corpo principal da aplicação.
  - Mantida apenas a instância com suporte ao botão de retorno inteligente (`onBack={() => setActiveTab(previousTab)}`), restaurando a visualização limpa e única do perfil do desenvolvedor, links sociais e especificações da arquitetura.
- **Botão Minimalista de Informações no Cabeçalho (`Header.tsx`)**:
  - Reposicionado o botão de acesso às informações para a **direita** do badge de versão (`[ Tema ]` → `[ Versão ]` → `[ Botão 'i' ]`).
  - Substituído o texto `"Sobre"` por um botão compacto e elegante (`w-7 h-7`) contendo o ícone universal de informações `(i)` (`Info` da biblioteca `lucide-react`).
  - Adicionado estilo Fluent com bordas suaves, tooltip explicativo e estado ativo em destaque na paleta corporativa Teams.
- **Sincronização de Metadados e Versionamento SemVer**:
  - Atualização uniforme de versão para **v2.5.14** em `package.json`, `TitleBar.tsx`, `Header.tsx`, `AboutView.tsx` e scripts de geração de MSI (`build_msi.js`, `build_custom_msi.js`).
- **Novo Pacote MSI v2.5.14**: Compilado com WiX Toolset v3.14 mantendo compatibilidade in-place upgrade e tamanho enxuto (~111 MB).

---

## Versão 2.5.13 (08/09/2026) - **Botões 'Deu Certo' e 'Não Deu Certo' com Rollback Automático da Transferência**
- **Substituição dos Botões Pós-Transferência (`FolderTransferView.tsx`)**:
  - Eliminados os termos técnicos anteriores (*"Excluir da Origem"* e *"Não, manter na Origem"*).
  - Adicionados dois botões orientados à validação humana e segurança:
    - **"Deu certo (Excluir da Origem)"**: O operador valida visualmente que a pasta está correta no destino. Ao clicar, o aplicativo apaga a pasta da origem com segurança para liberar espaço.
    - **"Não deu certo (Desfazer)"**: O operador sinaliza qualquer divergência. O aplicativo executa imediatamente o **rollback da transferência**, apagando os arquivos recém-copiados no destino e **mantendo os arquivos originais 100% intactos na pasta de origem**.
- **Novo Handler IPC `undo-transfer` no Backend (`electron/main.ts`)**:
  - Validação estrita de perímetro corporativo contra violação de compartilhamentos raiz.
  - Exclusão recursiva limpa das pastas copiadas no destino com rollback seguro.
  - Registro de auditoria com status `TRANSFER_UNDONE_ROLLBACK` e log corporativo explicativo.
- **Feedback Visual Informativo**:
  - Banners distintos para sucesso na validação (verde) e para transferência desfeita (azul), trazendo tranquilidade operacional ao usuário.
- **Novo Pacote MSI v2.5.13**: Compilado com WiX Toolset v3.14 mantendo tamanho enxuto (~111 MB).

---

## Versão 2.5.12 (08/09/2026) - **Relocação de 'Sobre o Desenvolvedor' para o Cabeçalho Superior e Despoluição da Barra Lateral**
- **Despoluição da Barra Lateral (`Sidebar.tsx`)**:
  - Removido o item *"Sobre o Desenvolvedor"* da lista de navegação lateral.
  - A barra lateral agora é dedicada 100% às tarefas e ferramentas operacionais: *Criar Pastas*, *Mover / Transferir Pastas*, *Configurações*, *Histórico & Auditoria* e *Manual & Diagnóstico*.
- **Integração no Cabeçalho Superior (`Header.tsx`)**:
  - Adicionado o botão discreto e elegante **"Sobre"** (com ícone `UserCheck`) no cabeçalho superior, ao lado do seletor de tema (Claro / Escuro / Sistema) e do badge de versão (`v2.5.12`).
  - Destaque visual estilo Fluent quando a visualização "Sobre" estiver ativa.
- **Navegação Bidirecional em `AboutView.tsx`**:
  - Inserido botão de retorno contextual ("← Voltar para as operações") no topo da visualização "Sobre" para permitir retorno imediato à tela operacional em que o usuário estava trabalhando.
  - Atualizado badge interno para `v2.5.12 Oficial`.
- **Controle Inteligente de Retorno (`App.tsx`)**:
  - Implementado gerenciamento de aba anterior (`previousTab`) para que clicar em "Sobre" no Header ou no botão de retorno volte perfeitamente para a tarefa em andamento.
- **Novo Pacote MSI v2.5.12**: Compilado com WiX Toolset v3.14 mantendo tamanho enxuto (~111 MB) e suporte a atualização in-place.

---

## Versão 2.5.11 (08/09/2026) - **Higienização Profunda contra Vazamento de Dados e Expansão do Manual de Uso**
- **Proteção Total contra Vazamento de Dados no Manual (`UserGuideView.tsx`)**:
  - Removidos quaisquer nomes específicos de empresas, servidores ou caminhos de rede privados do manual interno do aplicativo.
  - Eliminado o exemplo real de código de cliente (`10572 - AERO 0010`) e adotado exemplo neutro e ilustrativo (`0001 - CLIENTE EXEMPLO LTDA`).
  - Nenhuma senha ou credencial de acesso é citada ou exposta na interface do manual.
- **Instruções de Auditoria e Acesso a Logs para TI**:
  - Adicionada seção detalhada explicando a localização do botão discreto no canto inferior direito (`REGISTRO TI`).
  - Esclarecida a política de proteção por credencial corporativa e os recursos de telemetria, color coding de eventos, limpeza e exportação em `.txt`.
- **Enriquecimento do Guia Operacional**:
  - Seções completas de *Criação de Pastas*, finalidade das *7 Subpastas Departamentais*, *Transferência Segura* com perguntas intuitivas e *Histórico de Auditoria*.
  - Expansão de *Dúvidas Frequentes & Governança* sobre verificação de pastas já existentes e bloqueio de janela durante transmissões ativas.
- **Novo Pacote MSI v2.5.11**: Compilado com WiX Toolset mantendo tamanho enxuto (~111 MB).

---

## Versão 2.5.10 (08/09/2026) - **Registro de Atividades Privado (TI), Autenticação por Senha via Variável de Ambiente e Correção de Encoding**
- **Privacidade e Despoluição da Interface do Usuário**:
  - Removido o terminal de logs ao vivo da tela principal de criação (`FolderCreationView.tsx`), eliminando termos técnicos do escopo visual dos operadores comuns.
  - Removido o botão de logs do cabeçalho superior (`Header.tsx`).
- **Botão Escondido no Canto Inferior Direito**:
  - Posicionado botão minimalista e discreto (`opacity-25 hover:opacity-100`) no canto inferior direito da tela (`fixed bottom-2.5 right-3`), garantindo discrição e acesso restrito para a equipe de TI.
- **Autenticação por Senha via Variável de Ambiente (`TI_LOGS_PASSWORD`)**:
  - Implementado modal de segurança Fluent (`TIAccessModal.tsx`) exigindo a credencial do TI para desbloqueio dos registros.
  - Suporte à variável `TI_LOGS_PASSWORD` configurada no `.env` (valor: `Fallima1979`) e embutida no `default_config.json` dentro dos recursos do MSI.
- **Modal Completo de Registro de Atividades (`ActivityLogModal.tsx`)**:
  - Terminal escuro com tipografia monospace, color coding por categoria de log, auto-scroll, botões de "Limpar Logs", "Abrir TXT" e "Bloquear Sessão".
- **Correção Definitiva de Caracteres no Motor C# (`ExecuteAsUser.cs`)**:
  - Normalizadas as tags de console para `[AUTENTICACAO REDE AD]` e `[IMPERSONACAO WIN32]`, eliminando corrupção com losangos e interrogações (`\uFFFD`).
  - Compilação forçada em UTF-8 estrito (`/codepage:65001 /utf8output`).
- **Novo Pacote MSI v2.5.10**: Compilado com WiX Toolset mantendo tamanho enxuto (~111 MB) e suporte a atualização in-place.

---

## Versão 2.5.9 (08/09/2026) - **Realocação do Card 'Subpastas Padrão' para a Aba 'Manual & Diagnóstico'**
- **Despoluição da Tela Inicial (`FolderCreationView.tsx`)**:
  - Removido o card lateral que listava as subpastas padrão, permitindo que o formulário de criação ocupe a tela de forma mais limpa, ampla e focada na tarefa do operador.
- **Enriquecimento do Manual do Usuário (`UserGuideView.tsx`)**:
  - Inserida a seção visual detalhada **"Subpastas Padrão Geradas Automaticamente (7 Pastas)"** com o detalhamento operacional de cada pasta (`CONTABILIDADE`, `DP`, `EXPEDIÇÃO`, `FISCAL`, `PARALEGAL`, `RH`, `SPED`) diretamente no guia de criação de clientes.
- **Novo Pacote MSI v2.5.9**: Instalador oficial compilado e disponibilizado para atualização in-place mantendo integridade e tamanho enxuto (~111 MB).

---

## Versão 2.5.8 (08/09/2026) - **Linguagem Natural e Acessível na Transferência de Pastas ('Onde está a pasta?' / 'Para onde vai a pasta?')**
- **Humanização dos Rótulos de Transferência (`FolderTransferView.tsx`)**:
  - Rótulos atualizados de `"Pasta de Origem"` para **`"Onde está a pasta?"`** e de `"Pasta de Destino"` para **`"Para onde vai a pasta?"`**.
  - Alerta de violação de perímetro renomeado para **`"Local de Destino Inválido"`**, eliminando ambiguidades técnicas para operadores, assistentes e secretárias.
- **Novo Pacote MSI v2.5.8**: Instalador oficial compilado e disponibilizado para atualização in-place mantendo integridade e tamanho enxuto (~111 MB).

---

## Versão 2.5.7 (08/09/2026) - **Correção Definitiva de Encoding UTF-8 para Caracteres com Cedilha ('Ç') e Acentos**
- **Padronização UTF-8 no Motor Nativo C# (`ExecuteAsUser.exe`)**:
  - Configurados explicitamente `Console.OutputEncoding = new UTF8Encoding(false)` e `Console.InputEncoding = new UTF8Encoding(false)` no executável nativo Win32.
  - Eliminada a emissão de caracteres sob OEM Code Page CP850/Windows-1252, erradicando a corrupção de caracteres especiais como `Ç` (ex: `SERVIÇOS` sendo corrompido para `SERVIOS` com `\uFFFD`).
- **Decodificação Defensiva no Backend Electron (`electron/main.ts`)**:
  - Implementada função de decodificação resiliente (`decodeProcessOutput`) que processa streams de subprocessos em `Buffer`, com fallback automático para CP850/CP1252 caso qualquer utilitário legado do Windows emita bytes OEM.
  - Subpastas em shares de rede e logs de Robocopy agora preservam 100% da acentuação oficial do português brasileiro (`Ç`, `Ã`, `É`, `Ó`, etc.).
- **Novo Pacote MSI v2.5.7**: Instalador oficial compilado e disponibilizado para atualização in-place.

---

## Versão 2.5.6 (08/09/2026) - **Nova Tela 'Sobre o Desenvolvedor' com Redes Sociais e Identidade Entropy**
- **Nova Visualização 'Sobre o Desenvolvedor & Entropy' (`AboutView.tsx`)**:
  - Perfil oficial do desenvolvedor **André Abdala** (Desenvolvedor de Software & Arquiteto de Soluções).
  - Botões interativos com abertura segura no navegador padrão do Windows via `shell.openExternal`:
    - **GitHub**: `https://github.com/aabdalaa`
    - **LinkedIn**: `https://www.linkedin.com/in/andreabdala/`
    - **Instagram**: `https://www.instagram.com/_aabdala_/`
  - Apresentação da filosofia e pilares do ecossistema **ENTROPY** (Governança Estrita, Alta Performance, UX Familiar & Fluent).
  - Ficha técnica da aplicação com versão, arquitetura e direitos reservados.
- **Navegação Integrada**: Nova aba **"Sobre o Desenvolvedor"** adicionada ao menu lateral (`Sidebar.tsx`) com ícone corporativo.
- **Novo Pacote MSI v2.5.6**: Instalador oficial compilado e disponibilizado para atualização imediata in-place.

---

## Versão 2.5.5 (08/09/2026) - **Remoção de Linha Redundante de Versão na Barra Lateral e Polimento Visual**
- **Otimização da Barra Lateral**: Removida a linha `"Versão do App"` do card inferior da barra lateral (`Sidebar.tsx`), eliminando a sobreposição visual redundante e mantendo o card exclusivamente focado no `"Status dos Servidores"` (`RELIQUIA` e `RTO` com indicadores luminosos em tempo real).
- **Consistência de Identidade e Badges**: A versão oficial do aplicativo é exibida de maneira unificada e discreta exclusivamente na barra de título customizada (`TitleBar.tsx`) e no cabeçalho superior (`Header.tsx`).
- **Novo Pacote MSI v2.5.5**: Gerado instalador leve oficial com WiX Toolset e disponibilizado para atualização transparente in-place.

---

## Versão 2.5.4 (04/09/2026) - **Correção Integral do Pipeline de Build, Empacotamento ASAR e Otimização Extrema de Tamanho**
- **Eliminação da Recursão de Compilação (Efeito "Boneca Russa")**: Corrigido o script de empacotamento (`build_msi.js` e `build_custom_msi.js`) que copiava inadvertidamente instaladores `.msi` anteriores para dentro do pacote do próprio executável.
- **Empacotamento Seguro com ASAR e Exclusão Estrita**: Adicionadas regras estritas de `--ignore` e empacotamento com `--asar` no `electron-packager`, eliminando arquivos de código-fonte (`src/`), scripts de build e diretórios temporários do executável final.
- **Redução Drástica do Tamanho do Instalador e Executável**:
  - O instalador `.msi` final foi reduzido de **1.4 GB** para aproximadamente **80 MB** (mais de 90% de compressão).
  - O tempo de compilação do instalador WiX caiu de minutos para segundos.
  - A pasta do projeto foi despoluída de instaladores e caches legados, liberando mais de 10 GB de disco.
- **Preservação Integral dos Módulos Nativos**: `ExecuteAsUser.exe` mantido em `resources/core/` e `default_config.json` em `resources/` garantindo 100% de integridade operacional para criação e transferência com impersonação no Active Directory.

---

## Versão 2.5.3 (04/09/2026) - **Higienização Completa de UX/UI, Ocultação de Dados Técnicos/IPs e Simplificação de Textos**
- **Ocultação de Dados Técnicos e Infraestrutura**: Removida a exibição de endereços IP de todas as telas (botões de empresa RELIQUIA e RTO, status da barra lateral e configurações).
- **Remoção de Credenciais e Contas da Interface**: Removida a badge `pasta.paralegal` do cabeçalho superior e de todas as telas operacionais. Removidas credenciais e referências a APIs internas do manual interno do usuário.
- **Simplificação de Rótulos e Textos para Usuário Comum**:
  - Botão de seleção em massa renomeado de "Marcar Visíveis" para "SELECIONAR TODAS".
  - Campos renomeados de forma concisa para "Pasta de Origem" e "Pasta de Destino" (removidas descrições longas entre parênteses).
  - Removido o banner de perímetro de rede da interface visual (a validação de integridade permanece ativa silenciosamente em segundo plano).
  - Títulos e subtítulos humanizados, eliminando termos como "Robocopy", "Active Directory", "GPO" e "permissões NTFS".
- **Reestruturação do Manual do Usuário**: Transformado em guia operacional passo a passo focado no operador comum.

---

## Versão 2.5.2 (04/09/2026) - **Otimização Extrema de Velocidade de Cópia, Cobertura Total da Janela e Proteção contra Fechamento**
- **Eliminação de Varreduras Síncronas Lentas**: Removida a rotina `getFolderMetrics` que varria recursivamente toda a rede SMB antes e depois da cópia. A validação agora utiliza as métricas de tempo e integridade nativas entregues pelo Robocopy em C++ (`/MT:32`), reduzindo o tempo de transferência para apenas alguns segundos.
- **Cobertura Total da Janela (Inclusive TitleBar)**: Os modais translúcidos bloqueantes agora sobem para a camada absoluta mais alta (`z-[99999]`), cobrindo por completo a barra de título e impedindo qualquer interação com os botões Minimizar, Maximizar e Fechar durante a execução da transferência ou na decisão de confirmação.
- **Proteção Nativa contra Fechamento Acidental (Alt+F4 / Barra de Tarefas)**: Implementada interceptação do evento `window.on('close')` no Electron. Se o usuário tentar fechar o aplicativo durante uma transferência, o app cancela o fechamento e exibe um alerta de confirmação impedindo a corrupção de arquivos.

## Versão 2.5.1 (04/09/2026) - **Correção de Listagem no Preload, Modal Central com Backdrop Blur e Tela Inicial Padrão**
- **Correção da Exposição de API no Preload (`listSubdirectories`)**: Exposta explicitamente a função `listSubdirectories` no `contextBridge` (`electron/preload.ts`), eliminando em definitivo a mensagem de erro `ue.listSubdirectories is not a function`.
- **Tela Inicial Obrigatória em 'Criar Pastas'**: Rota padrão (`activeTab`) definida como `'dashboard'`, garantindo que o aplicativo sempre inicialize na tela principal de criação de pastas.
- **Novo Modal Central Flutuante com Fundo Translúcido (`backdrop-blur-md bg-slate-950/80`)**: Ao concluir a transferência segura, um modal de alto destaque surge centralizado bloqueando qualquer interação em segundo plano até a confirmação humana de manutenção ou exclusão da pasta na origem.
- **Correção de Caminhos Canônicos de Ex-Clientes**: Presets apontando diretamente para `CLIENTES\00 - EX CLIENTES` (irmã de `EMPRESAS`) e filtro protetivo contra pastas de governança na listagem de clientes ativos.
- **Upgrade In-Place Automatizado (SemVer)**: Incremento para `2.5.1` acionando a tabela de Major Upgrade do Windows Installer para substituir com 100% de integridade instalações anteriores.

## Versão 2.5.0 (03/09/2026) - **Módulo de Transferência Segura, Trava de Perímetro de TI & Redesign Teams / Fluent UI**
- **Módulo de Transferência Segura de Clientes**: Implementado fluxo em 3 etapas para migração de pastas de clientes ativos (ex.: para `00 - EX CLIENTES` ou `01 - EMPRESAS ENCERRADAS`). Realiza primeiro a cópia profunda via Robocopy sob o token `pasta.paralegal`, inspeciona o destino e solicita confirmação humana interativa antes de qualquer exclusão na origem.
- **Grade Interativa com Seleção em Massa & Busca Instantânea**: Elimina erros de digitação permitindo listar subpastas em tempo real, filtrar por código/nome e selecionar múltiplas pastas simultaneamente.
- **Trava de Governança e Perímetro de TI**: Bloqueio canônico rígido impedindo que pastas sejam enviadas para diretórios fora de `CLIENTES` (como `PUBLICO` ou `DIRETORIA`).
- **Redesign Microsoft Teams & Windows 11 Fluent UI**: Interface sóbria, elegante e corporativa com paleta Teams Blurple (`#5B5FC7`).
- **Modo Claro e Modo Escuro**: Suporte nativo com detecção automática do tema do Windows no primeiro uso, alternador no cabeçalho e persistência em `localStorage`.
- **Otimização de Foco Operacional**: Remoção da aba 'Gerador de MSI' da interface do usuário e ajuste de scripts de empacotamento.

---

## Versão 2.4.3 (26/08/2026) - **Execução Primária Nativa com `CreateProcessWithLogonW` sob o Token de `pasta.paralegal`**
- **Disparo de Processo sob Token Primário do AD (`CreateProcessWithLogonW`)**: Implementado o lançamento de processo com `LOGON_NETCREDENTIALS_ONLY` direto na API do Windows (advapi32.dll). O Robocopy é inicializado estritamente sob o token primário da conta de serviço `pasta.paralegal`, impedindo qualquer interferência da conta do usuário logado na estação (`franciele.lopes`, etc.).
- **Preservação de Dono e Permissões Administrativas**: Pastas e subpastas são criadas preservando integralmente o dono (`BUILTIN\Administradores` / Domínio) e as permissões de segurança NTFS copiadas do GPO MODELO.
- **Validação Completa em Laboratório**: Testado e validado em tempo real para RELIQUIA e RTO com retorno `ExitCode: 0` e confirmação de subpastas e dono.
- **Destaque Visual da Versão `v2.4.3`**: Badges na TitleBar, Header e Sidebar para validação imediata da versão em execução.
- **Pacote MSI v2.4.3**: Gerado na Área de Trabalho (`FolderWorks.msi`).

---

## Versão 2.4.2 (25/08/2026) - **Correção Absoluta de Escaping de Caminhos UNC (`String.raw`) & Validação Completa**
- **Correção de Escaping UNC em JavaScript/Node (`String.raw`)**: Identificado e corrigido o parsing de strings de caminhos UNC.
- **Normalização Defensiva de Prefixos no C# (`ExecuteAsUser.exe`)**: Garantia compulsoria de prefixos `\\`.
