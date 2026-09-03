# Entropy FolderWorks - Histórico de Lançamentos e Versionamento

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
