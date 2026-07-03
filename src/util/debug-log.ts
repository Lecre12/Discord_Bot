let debugLogsEnabled = true;

const LIBRARY_DEBUG_PREFIX = '[Speech][Debug]';
let filterInstalled = false;

function isLibraryDebugMessage(message: unknown): boolean {
  return typeof message === 'string' && message.startsWith(LIBRARY_DEBUG_PREFIX);
}

export function installDebugLogFilter(): void {
  if (filterInstalled) return;
  filterInstalled = true;

  const originalLog = console.log.bind(console);
  const originalWarn = console.warn.bind(console);

  console.log = (message?: unknown, ...args: unknown[]) => {
    if (!debugLogsEnabled && isLibraryDebugMessage(message)) return;
    originalLog(message, ...args);
  };

  console.warn = (message?: unknown, ...args: unknown[]) => {
    if (!debugLogsEnabled && isLibraryDebugMessage(message)) return;
    originalWarn(message, ...args);
  };
}

export function debugLog(message: string, ...args: unknown[]): void {
  if (!debugLogsEnabled) return;
  console.log(message, ...args);
}

export function debugWarn(message: string, ...args: unknown[]): void {
  if (!debugLogsEnabled) return;
  console.warn(message, ...args);
}

export function isDebugLogsEnabled(): boolean {
  return debugLogsEnabled;
}

export function setDebugLogsEnabled(enabled: boolean): void {
  debugLogsEnabled = enabled;
}

export function toggleDebugLogs(): boolean {
  debugLogsEnabled = !debugLogsEnabled;
  return debugLogsEnabled;
}
