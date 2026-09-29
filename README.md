# 🏢 Entropy FolderWorks

![Developer](https://img.shields.io/badge/Desenvolvedor-Andr%C3%A9%20Abdala%20%2F%20ENTROPY-7C3AED?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-34.x-4B5563?style=for-the-badge&logo=electron)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)
![Platform](https://img.shields.io/badge/Plataforma-Windows%20x64-blue?style=for-the-badge&logo=windows)
![Version](https://img.shields.io/badge/Vers%C3%A3o-3.0.0-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/Licen%C3%A7a-Propriet%C3%A1ria%20%2F%20Entropy-purple?style=for-the-badge)

O **Entropy FolderWorks** é a suíte corporativa desktop oficial do ecossistema **ENTROPY** projetada para automação de alta performance na criação, replicação e governança de estruturas de pastas de clientes em ambientes corporativos e redes Windows Domain / Active Directory (AD).

---

## 📥 Download Oficial do Instalador

Baixe a versão universal estável e autocontida para Windows x64:

👉 **[Download FolderWorks v3.0.0 (Instalador .MSI)](https://github.com/aabdalaa/FolderWorks/releases/latest)**

> [!TIP]
> O instalador `.MSI` oficial vem pronto para uso corporativo universal ("cru"). Ele não requer configuração em código nem compilação separada para cada empresa: basta instalar e vincular ao arquivo de configuração compartilhado na rede (`folderworks_config.json`).

---

## ✨ Principais Recursos

- **Configuração Centralizada & Compartilhada na Rede (SMB / UNC)**: A equipe de TI disponibiliza o arquivo `folderworks_config.json` em uma pasta compartilhada no servidor. Todas as estações conectadas sincronizam instantaneamente empresas, diretórios de destino, permissões, logotipos e esquemas de cores.
- **Definição Obrigatória de Senha do TI no Primeiro Acesso**: Modal bloqueante no primeiro uso para definição da senha mestra de TI, garantindo proteção total das configurações corporativas desde o primeiro minuto.
- **Identidade Visual Multi-Empresa & Cores**: Suporte a logotipo geral da aplicação e logotipos individuais para cada empresa cadastrada. O TI pode optar por cor única global ou cor individual por empresa (24 opções), com opção de bloquear e ocultar o seletor de cores para usuários comuns.
- **Atualização Dinâmica do Atalho Windows (`FolderWorks.lnk`)**: Ao atualizar a logomarca da aplicação, o atalho da Área de Trabalho e Menu Iniciar tem seu ícone `.ico` recalculado e injetado nativamente em tempo real em todas as máquinas conectadas à configuração compartilhada.
- **Criação Instantânea & Paralela com Multithreading**: Crie estruturas completas ou pastas vazias em lote com botão `+` concorrente via `Promise.all` e Robocopy `/MT:128`.
- **Preservação Absoluta de Permissões DACL/NTFS**: Duplicação exata de herança e direitos de segurança departamentais das pastas modelos do Active Directory.
- **Impersonação Nativa Win32 (C# / .NET 64-bit)**: Executa operações de rede estritamente sob o token da conta de serviço corporativa via `LogonUser` e `CreateProcessWithLogonW`.
- **Governança de TI & Perímetro Restrito**: Barreira de proteção contra criação ou movimentação fora das raízes de rede autorizadas com alerta sonoro e telemetria de bloqueio.
- **Validação de Transferência com Modo Seguro**: Inspeção direta no Windows Explorer, confirmação em duas etapas e função instantânea de Desfazer Transferência com auditoria.
- **Instalador Oficial MSI Cru & Autocontido**: Pacote `.MSI` universal gerado com WiX Toolset com suporte a atualizações in-place e encerramento automático de instâncias em uso.

---

## 🌐 Como Funciona a Configuração Centralizada na Rede

1. **Instale o MSI Oficial**: Baixe e instale o `FolderWorks-v3.0.0-win-x64.msi` nas estações de trabalho.
2. **Crie ou Copie o Arquivo de Configuração**: Coloque o arquivo `folderworks_config.json` em um compartilhamento de rede acessível pelos usuários (Ex: `\\servidor\compartilhamento\folderworks_config.json`). Você pode usar o modelo fornecido em [`folderworks_config.example.json`](./folderworks_config.example.json) ou clicar em **"Criar na Rede"** dentro do próprio aplicativo.
3. **Vincule a Estação**: No FolderWorks, acesse **Configurações** → **Configuração Centralizada na Rede Corporativa** e clique em **"Vincular Arquivo na Rede"** (ou cole o caminho UNC e clique em **"Conectar"**).
4. **Sincronização em Tempo Real**: Sempre que o TI alterar uma empresa, caminho de rede ou o logotipo corporativo, todas as estações de trabalho conectadas atualizam simultaneamente!

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Desktop Runtime**: Electron 34 com contextIsolation e preload bridges seguros.
- **Motor de Execução Nativo**: C# (.NET Framework 4.0 / AnyCPU x64) com Win32 API (`advapi32.dll` / `kernel32.dll`).
- **Instalação e Empacotamento**: WiX Toolset v3.14 com `electron-wix-msi` e Electron Packager ASAR.

---

## 🚀 Como Executar em Modo Desenvolvimento

### 1. Clonar o repositório
```bash
git clone https://github.com/aabdalaa/FolderWorks.git
cd FolderWorks
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar ambiente (opcional para testes locais)
```bash
cp .env.example .env
```

### 4. Executar em modo desenvolvimento
```bash
npm run dev
```

---

## 📦 Como Compilar o Pacote Instalador (.MSI)

Para compilar o pacote instalador oficial universal:
```bash
npm run build:msi
```
O pacote será gerado em `dist/msi/FolderWorks.msi` pronto para distribuição via GPO ou instalação manual em computadores corporativos.

---

## 👤 Autor e Desenvolvedor

**André Abdala**  
*Desenvolvedor de Software & Criador do Ecossistema ENTROPY*

- **GitHub**: [github.com/aabdalaa](https://github.com/aabdalaa)
- **LinkedIn**: [linkedin.com/in/andreabdala](https://www.linkedin.com/in/andreabdala/)
- **Instagram**: [@\_aabdala\_](https://www.instagram.com/_aabdala_/)

---

## 🌌 Ecossistema ENTROPY

> *"A transformação do caos, da complexidade técnica e da desordem do mundo real em sistemas funcionais, claros e controlados."*
