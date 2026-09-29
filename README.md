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

## ✨ Principais Recursos

- **Criação Instantânea & Paralela com Multithreading**: Crie estruturas completas ou pastas vazias em lote com botão `+` concorrente via `Promise.all` e Robocopy `/MT:128`.
- **Preservação Absoluta de Permissões DACL/NTFS**: Duplicação exata de herança e direitos de segurança departamentais das pastas modelos do Active Directory.
- **Impersonação Nativa Win32 (C# / .NET 64-bit)**: Executa operações de rede estritamente sob o token da conta de serviço corporativa via `LogonUser` e `CreateProcessWithLogonW`.
- **Governança de TI & Perímetro Restrito**: Barreira de proteção contra criação ou movimentação fora das raízes de rede autorizadas com alerta sonoro e telemetria de bloqueio.
- **Validação de Transferência com Modo Seguro**: Inspeção direta no Windows Explorer, confirmação em duas etapas e função instantânea de Desfazer Transferência com auditoria.
- **Personalização Dinâmica de Marca & Cores**: Catálogo com 24 paletas corporativas integradas dinamicamente ao DOM e suporte a modo Claro e Escuro.
- **Instalador Oficial MSI Autocontido**: Pacote `.MSI` gerado com WiX Toolset v3.14 com suporte a atualizações in-place e encerramento automático de instâncias em uso.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Desktop Runtime**: Electron 34 com contextIsolation e preload bridges seguros.
- **Motor de Execução Nativo**: C# (.NET Framework 4.0 / AnyCPU x64) com Win32 API (`advapi32.dll` / `kernel32.dll`).
- **Instalação e Empacotamento**: WiX Toolset v3.14 com `electron-wix-msi` e Electron Packager ASAR.

---

## 🚀 Como Executar em Desenvolvimento

### 1. Clonar o repositório
```bash
git clone https://github.com/aabdalaa/FolderWorks.git
cd FolderWorks
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar ambiente
Copie o template de ambiente:
```bash
cp .env.example .env
```
Preencha as variáveis corporativas de sua rede no arquivo `.env`.

### 4. Executar em modo desenvolvimento
```bash
npm run dev
```

---

## 📦 Como Compilar o Pacote Instalador (.MSI)

Para compilar o pacote instalador completo com configurações e credenciais embutidas de forma segura:
```bash
npm run build:msi
```
O pacote será gerado em `dist/msi/FolderWorks.msi` pronto para distribuição via GPO ou instalação manual em máquinas corporativas.

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
