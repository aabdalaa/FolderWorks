# Entropy FolderWorks - Histórico de Lançamentos e Versionamento

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
