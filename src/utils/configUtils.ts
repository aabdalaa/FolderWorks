export const SYSTEM_CONFIG_KEYS = new Set([
  'isLockedByMSI',
  'tiLogsPassword',
  'sharedLogFilePath',
  'customLogo',
  'appLogo',
  'colorTheme',
  'lockColorTheme',
  'colorMode',
  '_isSharedNetworkConfig',
  '_sharedConfigFilePath',
  '_isOfflineCache',
]);

/**
 * Retorna estritamente as chaves das empresas cadastradas na configuração,
 * filtrando com segurança todas as chaves do sistema (senhas, logos, temas, etc.).
 */
export function getCompanyKeys(config: any): string[] {
  if (!config || typeof config !== 'object') return [];
  return Object.keys(config).filter(
    (key) =>
      !SYSTEM_CONFIG_KEYS.has(key) &&
      !key.startsWith('_') &&
      config[key] &&
      typeof config[key] === 'object'
  );
}

/**
 * Valida se uma chave e valor específicos representam um objeto de empresa válido.
 */
export function isCompanyConfig(key: string, val: any): boolean {
  return (
    !SYSTEM_CONFIG_KEYS.has(key) &&
    !key.startsWith('_') &&
    val !== null &&
    typeof val === 'object'
  );
}
