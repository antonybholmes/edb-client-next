import { IS_DEV_MODE } from '@/consts'
import log from 'loglevel'

// Only run in browser
if (typeof window !== 'undefined') {
  const logLevel = IS_DEV_MODE
    ? log.levels.DEBUG
    : ((process.env.NEXT_PUBLIC_LOG_LEVEL ??
        log.levels.SILENT) as log.LogLevelDesc)

  log.setLevel(logLevel)
}

// Export a logger object with nice prefixes
export const logger = {
  log: (...args: unknown[]) =>
    log.info(new Date().toISOString(), '[LOG]', ...args),
  debug: (...args: unknown[]) =>
    log.debug(new Date().toISOString(), '[DEBUG]', ...args),
  info: (...args: unknown[]) =>
    log.info(new Date().toISOString(), '[INFO]', ...args),
  warn: (...args: unknown[]) =>
    log.warn(new Date().toISOString(), '[WARN]', ...args),
  error: (...args: unknown[]) =>
    log.error(new Date().toISOString(), '[ERROR]', ...args),
}

// const levels = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 }

// const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'silent'

// const currentLevel = IS_DEV ? 0 : (levels[logLevel as keyof typeof levels] ?? 4)

// export const logger = {
//   debug: (...args: any[]) => currentLevel <= 0 && console.debug(...args),
//   info: (...args: any[]) => currentLevel <= 1 && console.info(...args),
//   warn: (...args: any[]) => currentLevel <= 2 && console.warn(...args),
//   error: (...args: any[]) => currentLevel <= 3 && console.error(...args),
//   log: (...args: any[]) => currentLevel <= 1 && console.log(...args),
// }

// export const logger = {
//   log: (...args: any[]) => {
//     if (IS_DEV || logLevel === 'debug' || logLevel === 'info') {
//       console.log(...args)
//     }
//   },
//   debug: (...args: any[]) => {
//     if (IS_DEV || logLevel === 'debug') {
//       console.debug(...args)
//     }
//   },
//   info: (...args: any[]) => {
//     if (logLevel !== 'silent') {
//       console.info(...args)
//     }
//   },
//   warn: (...args: any[]) => {
//     if (logLevel !== 'silent') {
//       console.warn(...args)
//     }
//   },
//   error: (...args: any[]) => {
//     if (logLevel !== 'silent') {
//       console.error(...args)
//     }
//   },
// }
