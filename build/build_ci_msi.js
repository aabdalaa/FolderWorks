const { compileCustomMSI } = require('./build_custom_msi.js');
const fs = require('fs');

async function main() {
  const cfgPath = process.argv[2] || 'custom_config.json';
  const targetMsi = process.argv[3] || 'FolderWorks_Custom.msi';

  if (!fs.existsSync(cfgPath)) {
    console.error('Arquivo de configuração não encontrado:', cfgPath);
    process.exit(1);
  }

  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
  console.log('[-] Iniciando compilação do MSI para o pacote:', targetMsi);
  await compileCustomMSI(cfg, targetMsi);
  console.log('✓ MSI compilado com sucesso para:', targetMsi);
}

main().catch(err => {
  console.error('Falha crítica na compilação:', err);
  process.exit(1);
});
