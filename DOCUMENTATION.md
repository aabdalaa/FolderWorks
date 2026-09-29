# 📘 Manual Técnico e Documentação Completa do Aplicativo Entropy FolderWorks

> [!NOTE]
> Esta é a documentação oficial e técnica da suíte de automação **Entropy FolderWorks**, desenvolvida para ambientes corporativos multi-empresa e multi-servidor com suporte a Active Directory. Este manual aborda a arquitetura, credenciais de rede, fluxo do Robocopy com preservação de permissões NTFS, procedimentos de atualização via Windows Installer (.MSI) e o passo a passo para configuração de diretórios modelo na rede.

---

## 📋 Sumário
1. [Visão Geral e Arquitetura do Aplicativo](#1-visão-geral-e-arquitetura-do-aplicativo)
2. [Dependências de Infraestrutura e Credenciais de Rede (AD)](#2-dependências-de-infraestrutura-e-credenciais-de-rede-ad)
3. [Mecanismo de Transferência e Permissões NTFS (Robocopy /MT:64)](#3-mecanismo-de-transferência-e-permissões-ntfs-robocopy-mt64)
4. [Guia de Configuração e Aplicação da GPO nas Pastas Modelo](#4-guia-de-configuração-e-aplicação-da-gpo-nas-pastas-modelo)
5. [Guia de Compilação, Empacotamento e Atualização In-Place (.MSI)](#5-guia-de-compilação-empacotamento-e-atualização-in-place-msi)
6. [Diagnóstico de Falhas e Logs de Sistema (Troubleshooting)](#6-diagnóstico-de-falhas-e-logs-de-sistema-troubleshooting)

---

## 1. Visão Geral e Arquitetura do Aplicativo

O **Entropy FolderWorks** foi projetado para resolver a complexidade de criação e replicação de estruturas organizacionais de pastas societárias e contábeis em rede SMB para novas empresas clientes.

### Diagrama de Arquitetura do Sistema

```mermaid
flowchart TD
    A["👤 Operador (Electron GUI)"] -->|Digita Nome da Empresa| B["⚡ IPC Main Handler"]
    B -->|Autenticação AD| C["🔐 Net Use (Conta de Serviço)"]
    C -->|Servidor Empresa 01 (10.0.0.10)| D["📁 Modelo Empresa 01"]
    C -->|Servidor Empresa 02 (10.0.0.20)| E["📁 Modelo Empresa 02"]
    D -->|Robocopy /MT:64 /COPY:DATS| F["🏢 Destino Cliente Empresa 01 (10.0.0.10)"]
    E -->|Robocopy /MT:64 /COPY:DATS| G["🏢 Destino Cliente Empresa 02 (10.0.0.20)"]
    F -->|Ajustes| H["✅ Renomeia EXPEDIÇÃO & Remove GERÊNCIA"]
    G -->|Ajustes| H
```

### Componentes Tecnológicos
- **Core Framework**: Electron (Node.js + Chromium) com interface moderna em Fluent / Dark Mode.
- **Motor de Transferência**: Robocopy nativo do Windows com multithreading em nível 64 (`/MT:64`), garantindo velocidade máxima de rede SMB sem travar o computador.
- **Proteção de Código**: JS Obfuscator com conversão de strings base64 e flatten de controle de fluxo na compilação.
- **Instalador**: WiX Toolset gerando pacote MSI nativo com GUID de atualização in-place (`UpgradeCode`).

---

## 2. Dependências de Infraestrutura e Credenciais de Rede (AD)

Para o correto funcionamento do aplicativo, a infraestrutura deve atender aos seguintes requisitos de rede e contas do Active Directory:

### 🔑 Credenciais do Usuário da Rede (AD)
O aplicativo utiliza uma conta dedicada do Active Directory para autenticar as conexões de rede antes de iniciar a cópia. Isso permite que qualquer colaborador (mesmo sem direitos administrativos) crie as pastas com as permissões corretas.

- **Usuário AD**: `DOMINIO\pasta.servico` (ou conta definida pela TI)
- **Senha AD**: `[Definida pela TI]`
- **Função**: Autenticação via impersonação Win32 / net use nos servidores de arquivos.

> [!IMPORTANT]
> A conta de serviço configurada deve possuir permissão de **Modificação/Leitura** na pasta compartilhada de modelo de pastas e permissão de **Controle Total / Modificação** na pasta de destino de clientes (`EMPRESAS`).

### 🌐 Mapeamento de Servidores e Caminhos de Rede (Exemplo)

| Empresa | Servidor da GPO (Modelo) | Servidor de Destino (Clientes) | Caminho Completo do Modelo | Caminho Completo de Destino |
| :--- | :--- | :--- | :--- | :--- |
| **EMPRESA 01** | `10.0.0.10` | `10.0.0.10` | `\\10.0.0.10\gpo\criarpastas\MODELO` | `\\10.0.0.10\arquivos\CLIENTES\EMPRESAS\` |
| **EMPRESA 02** | `10.0.0.20` | `10.0.0.20` | `\\10.0.0.20\gpo\criarpastas\MODELO` | `\\10.0.0.20\arquivos\CLIENTES\EMPRESAS\` |

---

## 3. Mecanismo de Transferência e Permissões NTFS (Robocopy /MT:64)

### Comando Exato do Robocopy
O aplicativo aciona o seguinte comando parametrizado:

```powershell
robocopy "<Origem_Modelo>" "<Destino_Cliente>" /E /COPY:DATS /DCOPY:DAT /MT:64 /R:1 /W:1 /NFL /NDL /NJH /NJS /nc /ns /np
```

### Explicação dos Parâmetros

| Flag | Significado e Função Técnica |
| :--- | :--- |
| `/E` | Copia todos os subdiretórios, incluindo diretórios vazios. |
| `/COPY:DATS` | Copia **D**ados, **A**tributos, **T**imestamps e **S**egurança (DACLs NTFS). Preserva as permissões originais do domínio. |
| `/DCOPY:DAT` | Copia informações de diretórios (**D**ados, **A**tributos e **T**imestamps de pastas). |
| `/MT:64` | Executa a cópia em **64 threads paralelas** de rede SMB (mitigando gargalos e processando milhares de pastas em poucos segundos). |
| `/R:1 /W:1` | Tenta novamente em caso de falha apenas 1 vez aguardando 1 segundo (evita travamento do app se algum arquivo estiver preso). |
| `/NFL /NDL /NJH...` | Suprime saída excessiva de logs no console para maximizar a performance e evitar consumo de memória I/O. |

### Por que NÃO usar SDDLs hardcoded ou SIDs manuais?
Cada domínio Active Directory possui identificadores de segurança únicos (SIDs `S-1-5-21...`). Ao utilizar o Robocopy puro diretamente da pasta modelo do próprio domínio, **o Windows mantém os usuários reais do domínio em cada servidor**, evitando que apareçam "Contas Desconhecidas" no Windows Explorer.

---

## 4. Guia de Configuração e Aplicação da GPO nas Pastas Modelo

Para alterar permissões ou criar novas subpastas no modelo para todas as futuras empresas, as alterações devem ser feitas **exclusivamente na pasta `MODELO` do servidor de arquivos/GPO**.

### 📁 Departamentos Principais no Modelo
A pasta `MODELO` pode conter, por exemplo, as seguintes subpastas organizacionais:
1. `CONTABILIDADE`
2. `DP` (ou `PESSOAL`)
3. `EXPEDIÇÃO`
4. `FISCAL`
5. `PARALEGAL`
6. `RH`
7. `SPED`

### 🛠️ Passo a Passo para Configurar/Aplicar a Herança Protegida (`D:PAI` / "Herdado de: Nenhum")

> [!TIP]
> Cada subpasta de departamento deve ter a **herança do diretório pai desabilitada** e convertida em permissões explícitas para garantir o isolamento entre departamentos.

1. **Acesse a Pasta Modelo no Servidor**:
   - Para Empresa 01: `\\10.0.0.10\gpo\criarpastas\MODELO`
   - Para Empresa 02: `\\10.0.0.20\gpo\criarpastas\MODELO`
2. **Quebrar a Herança no Departamento desejado**:
   - Clique com o botão direito na pasta do departamento (ex: `CONTABILIDADE`) -> **Propriedades**.
   - Acesse a aba **Segurança** e clique no botão **Avançadas**.
   - Clique em **Desabilitar Herança**.
   - Na caixa de diálogo que abrir, selecione: **"Converter permissões herdadas em permissões explícitas neste objeto"**.
3. **Ajustar as Permissões dos Grupos do Domínio**:
   - Adicione o grupo específico do departamento com permissão de **Modificar** (ex: `DOMINIO\CONTABIL` na pasta `CONTABILIDADE`).
   - Adicione os grupos de TI (`DOMINIO\TI - MASTER`, `DOMINIO\TI - ADMIN`) com permissão de **Controle Total**.
   - Remova o grupo geral de usuários ou `Todos` de permissões de escrita.
4. **Propagar as Permissões para Subpastas**:
   - Na janela de **Configurações de Segurança Avançadas**, marque a opção:
     ☑ **"Substituir todas as entradas de permissão de objetos filhos por permissões herdáveis deste objeto"**.
   - Clique em **Aplicar** e **OK**.
5. **Pronto!**: A partir deste momento, qualquer pasta criada pelo **Entropy FolderWorks** herdará essa estrutura e permissões com 100% de precisão.

---

## 5. Guia de Compilação, Empacotamento e Atualização In-Place (.MSI)

### 📂 Estrutura de Arquivos do Código Fonte

```text
FolderWorks/
├── .env.example          # Modelo de variáveis de ambiente com caminhos UNC dos servidores
├── package.json          # Metadados e versão do produto
├── build/
│   └── build_msi.js      # Script de ofuscação e compilação do MSI via WiX
└── src/
    ├── App.tsx           # Aplicação React com Tailwind CSS e Lucide Icons
    ├── components/       # Módulos de interface (Criação, Renomeação, Transferência, etc.)
    └── assets/           # Ícone (.ico) e Logotipo (.png)
```

### ⚙️ Procedimento para Recompilar o Instalador MSI

Para compilar uma nova versão do aplicativo e gerar o instalador `.msi`:

1. **Abra o Terminal no diretório do projeto**:
   ```powershell
   cd C:\Projetos\FolderWorks
   ```
2. **Incrementar a Versão do Produto (Obrigatório para Atualização In-Place)**:
   - Em `package.json`, altere a versão (ex: `"version": "3.0.0"`).
   - Em `build/build_msi.js`, altere o campo `version` no MSICreator.
3. **Executar o Build**:
   ```powershell
   npm run build:msi
   ```
4. **Resultado**:
   O script compilará a aplicação Vite/Electron, aplicará a ofuscação, chamará o WiX Toolset e entregará o instalador atualizado em:
   - `dist-msi/FolderWorks-v3.0.0-win-x64.msi`

> [!IMPORTANT]
> O instalador utiliza o GUID fixo `upgradeCode: '8f74a92c-561b-4632-9b21-3a218d6e9f10'`. Sempre que o número da versão for incrementado, a execução do `.msi` substituirá a versão anterior instalada em `C:\Program Files (x86)\FolderWorks\` de forma automática.

---

## 6. Diagnóstico de Falhas e Logs de Sistema (Troubleshooting)

### 📄 Localização do Arquivo de Log
Todas as operações de criação de pastas, autenticações de rede e códigos de retorno do Robocopy são registradas no arquivo de log do sistema em:

```text
%APPDATA%\Entropy\FolderWorks\entropy_folderworks.log
(Caminho completo: C:\Users\<Usuário>\AppData\Roaming\Entropy\FolderWorks\entropy_folderworks.log)
```

### 🔍 Soluções para Problemas Frequentes

| Sintoma / Erro no Log | Causa Provável | Solução Recomendada |
| :--- | :--- | :--- |
| `[ERRO CRÍTICO] Caminho do modelo GPO não encontrado na rede` | O servidor de modelo (10.0.0.10 ou 10.0.0.20) está offline ou o caminho no `.env` está incorreto. | Verifique se a pasta de modelo está compartilhada e teste a conectividade Ping/SMB (porta 445) com o servidor. |
| `Robocopy finalizou com código de saída 16` | A conta de serviço não obteve acesso à pasta de destino ou o caminho de destino não existe. | Verifique se a senha da conta de serviço expirou no AD ou se o compartilhamento de destino está acessível. |
| `O aplicativo instalado não reflete as alterações do MSI` | A versão do produto no `build_msi.js` não foi incrementada em relação à versão instalada. | Incremente a versão (ex: `1.0.0` -> `1.0.1`) e recompile o MSI para forçar o Major Upgrade do Windows Installer. |

---
*Documentação gerada e validada para ambientes corporativos Windows Server / Active Directory.*
