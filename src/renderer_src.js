const { ipcRenderer } = require('electron');

// ELEMENTOS DA INTERFACE (DOM CONTROLS)
const btnExit = document.getElementById('btnExit');
const btnAbout = document.getElementById('btnAbout');
const modalAbout = document.getElementById('modalAbout');
const btnCloseModal = document.getElementById('btnCloseModal');
const linkGitHub = document.getElementById('linkGitHub');
const linkLinkedIn = document.getElementById('linkLinkedIn');

const cardRTO = document.getElementById('cardRTO');
const cardReliquia = document.getElementById('cardReliquia');
const radioRTO = document.getElementById('radioRTO');
const radioReliquia = document.getElementById('radioReliquia');

const bannerSelectedCompany = document.getElementById('bannerSelectedCompany');
const lblSelectedCompanyText = document.getElementById('lblSelectedCompanyText');

const txtClientName = document.getElementById('txtClientName');

const panelConfirmation = document.getElementById('panelConfirmation');
const lblConfirmEmpresa = document.getElementById('lblConfirmEmpresa');
const lblConfirmCliente = document.getElementById('lblConfirmCliente');
const lblConfirmOperacao = document.getElementById('lblConfirmOperacao');

const progressContainer = document.getElementById('progressContainer');
const progressBarFill = document.getElementById('progressBarFill');
const lblProgressStatus = document.getElementById('lblProgressStatus');

const btnCreateFolder = document.getElementById('btnCreateFolder');
const lblLogOutput = document.getElementById('lblLogOutput');

// CONFIGURAÇÃO SELECIONADA
let selectedCompanyKey = null;

const COMPANIES = {
  '1': {
    key: '1',
    name: 'RTO',
    fullDisplayName: 'RTO CONSULTORIA EMPRESARIAL'
  },
  '2': {
    key: '2',
    name: 'RELIQUIA',
    fullDisplayName: 'RELIQUIA ASSESSORIA CONTÁBIL'
  }
};

// ATALHOS DE TECLADO (1, 2, ESC)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAboutModal();
    resetFormStateKeepAppOpen();
    return;
  }

  if (document.activeElement === txtClientName) {
    return;
  }

  if (e.key === '1') {
    selectCompany('1');
    logMessage('Opção [1] selecionada via teclado: RTO');
  } else if (e.key === '2') {
    selectCompany('2');
    logMessage('Opção [2] selecionada via teclado: RELIQUIA');
  }
});

// EVENTOS DE CLIQUE DOS CARDS
cardRTO.addEventListener('click', () => selectCompany('1'));
cardReliquia.addEventListener('click', () => selectCompany('2'));

// SELEÇÃO DA EMPRESA
function selectCompany(key) {
  selectedCompanyKey = key;
  const config = COMPANIES[key];

  if (key === '1') {
    cardRTO.classList.add('selected');
    radioRTO.textContent = '⦿';
    cardReliquia.classList.remove('selected');
    radioReliquia.textContent = '◯';
    
    bannerSelectedCompany.classList.remove('hidden');
    lblSelectedCompanyText.textContent = `✓ EMPRESA SELECIONADA: ${config.fullDisplayName}`;
  } else if (key === '2') {
    cardReliquia.classList.add('selected');
    radioReliquia.textContent = '⦿';
    cardRTO.classList.remove('selected');
    radioRTO.textContent = '◯';

    bannerSelectedCompany.classList.remove('hidden');
    lblSelectedCompanyText.textContent = `✓ EMPRESA SELECIONADA: ${config.fullDisplayName}`;
  }

  validateFormAndShowConfirmation();
  focusClientInput();
}

// VALIDAÇÃO DO FORMULÁRIO EM TEMPO REAL
txtClientName.addEventListener('input', validateFormAndShowConfirmation);

function validateFormAndShowConfirmation() {
  const clientName = txtClientName.value.trim();

  if (selectedCompanyKey && clientName.length > 0) {
    const config = COMPANIES[selectedCompanyKey];
    lblConfirmEmpresa.textContent = `• Empresa: ${config.fullDisplayName}`;
    lblConfirmCliente.textContent = `• Cliente / Pasta: ${clientName}`;
    lblConfirmOperacao.textContent = `• Ação: Criação da estrutura de pastas de atendimento`;

    panelConfirmation.classList.remove('hidden');
    btnCreateFolder.disabled = false;
  } else {
    panelConfirmation.classList.add('hidden');
    btnCreateFolder.disabled = true;
  }
}

// BOTÃO PRINCIPAL DE CRIAÇÃO
btnCreateFolder.addEventListener('click', async () => {
  if (!selectedCompanyKey) return;
  const clientName = txtClientName.value.trim();
  if (!clientName) return;

  btnCreateFolder.disabled = true;
  txtClientName.disabled = true;
  progressContainer.classList.remove('hidden');
  progressBarFill.style.width = '30%';
  lblProgressStatus.textContent = 'Iniciando criação da estrutura de atendimento...';

  logMessage(`[INÍCIO] Empresa: ${COMPANIES[selectedCompanyKey].name} | Cliente: ${clientName}`);

  try {
    const result = await ipcRenderer.invoke('create-folder', {
      companyKey: selectedCompanyKey,
      clientName: clientName
    });

    if (result.success) {
      progressBarFill.style.width = '100%';
      lblProgressStatus.textContent = `✓ ESTRUTURA CRIADA COM SUCESSO PARA: ${clientName}`;
      logMessage(`[SUCESSO] Estrutura de pastas criada para ${clientName}.`);

      resetFormStateKeepAppOpen();
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    progressBarFill.style.width = '0%';
    lblProgressStatus.textContent = `❌ ERRO NA CRIAÇÃO: ${err.message}`;
    logMessage(`[ERRO] ${err.message}`);
  } finally {
    txtClientName.disabled = false;
    validateFormAndShowConfirmation();
    focusClientInput();
  }
});

// RESTAURAÇÃO DO FORMULÁRIO MANTENDO O APP ABERTO E PRONTO PARA A PRÓXIMA PASTA
function resetFormStateKeepAppOpen() {
  txtClientName.value = '';
  txtClientName.disabled = false;

  progressContainer.classList.remove('hidden');
  setTimeout(() => {
    progressContainer.classList.add('hidden');
    progressBarFill.style.width = '0%';
  }, 4000);

  validateFormAndShowConfirmation();

  logMessage('[PRONTO] Aplicativo pronto para a próxima criação de pasta.');
  focusClientInput();
}

function focusClientInput() {
  setTimeout(() => {
    txtClientName.disabled = false;
    txtClientName.focus();
  }, 50);
}

// MODAL SOBRE O APP E LINKS SOCIAIS
btnAbout.addEventListener('click', () => {
  modalAbout.classList.remove('hidden');
});

btnCloseModal.addEventListener('click', closeAboutModal);

modalAbout.addEventListener('click', (e) => {
  if (e.target === modalAbout) {
    closeAboutModal();
  }
});

function closeAboutModal() {
  modalAbout.classList.add('hidden');
}

linkGitHub.addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('open-external-url', 'https://github.com/aabdalaa');
});

linkLinkedIn.addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('open-external-url', 'https://www.linkedin.com/in/andreabdala/');
});

// SAIR / ENCERRAR
btnExit.addEventListener('click', () => {
  ipcRenderer.send('exit-app');
});

// REGISTRO DE LOGS NO FOOTER
function logMessage(msg) {
  const time = new Date().toLocaleTimeString('pt-BR');
  lblLogOutput.textContent = `[SISTEMA] [${time}] ${msg}`;
}
