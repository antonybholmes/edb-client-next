const isDev = process.env.NODE_ENV === 'development'
const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'silent'

export const logger = {
  log: (...args: any[]) => {
    if (isDev || logLevel === 'debug' || logLevel === 'info') {
      console.log(...args)
    }
  },
  debug: (...args: any[]) => {
    if (isDev || logLevel === 'debug') {
      console.debug(...args)
    }
  },
  info: (...args: any[]) => {
    if (logLevel !== 'silent') {
      console.info(...args)
    }
  },
  warn: (...args: any[]) => {
    if (logLevel !== 'silent') {
      console.warn(...args)
    }
  },
  error: (...args: any[]) => {
    if (logLevel !== 'silent') {
      console.error(...args)
    }
  },
}
