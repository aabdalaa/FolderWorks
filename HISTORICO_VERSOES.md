# Entropy FolderWorks - Histórico de Lançamentos e Versionamento

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
