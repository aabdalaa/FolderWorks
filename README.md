# 🏢 Entropy FolderWorks - Suíte de Automação de Estrutura de Pastas

![Developer](https://img.shields.io/badge/Desenvolvedor-Andr%C3%A9%20Abdala%20%2F%20ENTROPY-7C3AED?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-31.7.7-4B5563?style=for-the-badge&logo=electron)
![License](https://img.shields.io/badge/Licen%C3%A7a-MIT-green?style=for-the-badge)

O **Entropy FolderWorks** é o aplicativo desktop oficial da suíte **ENTROPY** para automação da criação de estruturas de pastas de clientes para setores jurídicos e paralegal. Suporta cópia de permissões de segurança **NTFS (/SEC)**, resiliência autossuficiente (fallback nativo), interface sem serrilhados e inicialização automática em **Tela Cheia**.

---

## 💻 Recursos e Funcionalidades

- **Interface Web Desktop 100% Anti-Serrilhada**: Desenvolvido sobre a engine Chromium (Electron) com CSS Grid/Flexbox e design em tons de roxo (*Dark Violet Theme*).
- **Cópia Exata de Permissões NTFS (/SEC)**: Duplica 100% das permissões de grupos do Active Directory das pastas modelos.
- **Fallback Autossuficiente**: Se os modelos da rede estiverem indisponíveis, cria a árvore de pastas embutida em código nativo JS.
- **Segurança & Proteção Anti-Engenharia Reversa**: Script de build automatizado com ofuscação de código de alta intensidade.
- **Gerenciamento com `.env`**: Configuração simplificada de IPs e caminhos de rede via arquivo de ambiente.

---

## 🛠️ Como Configurar e Rodar

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/seu-usuario/entropy-folderworks.git
cd entropy-folderworks
npm install
```

### 2. Configurar o arquivo `.env`
Renomeie o arquivo `.env.example` para `.env` e configure os endereços IP e caminhos dos servidores:
```env
RTO_DISPLAY_NAME="RTO CONSULTORIA EMPRESARIAL"
RTO_SOURCE_PATH="\\192.168.50.102\gpo\criarpastas_paralegal\MODELO 2026"
RTO_DESTINATION_PATH="\\192.168.50.102\rto\CLIENTES\EMPRESAS"

RELIQUIA_DISPLAY_NAME="RELIQUIA ASSESSORIA CONTÁBIL"
RELIQUIA_SOURCE_PATH="\\192.168.100.30\gpo\criarpastas_paralegal\MODELO 2026"
RELIQUIA_DESTINATION_PATH="\\192.168.1.242\reliquia-arquivos\CLIENTES\EMPRESAS"
```

### 3. Executar o aplicativo em modo desenvolvimento
```bash
npm start
```

---

## 📦 Como Gerar o Instalador Protegido (.MSI)

Para gerar o pacote de instalação executável criptografado:
```bash
npm run build:msi
```
O arquivo `.msi` final será gerado em `dist/msi/EntropyFolderWorks.msi`.

---

## 👤 Autor
Desenvolvido por **André Abdala** (`ENTROPY`).
