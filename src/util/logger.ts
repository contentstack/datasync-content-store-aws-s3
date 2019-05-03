import { validateLogger } from './validations'

/**
 * @summary Creates a logger instance
 * @example
 *    const log = createLogger(instance)
 *    log.info('Hello world!')
 */
export const setLogger = (customLogger?) => {
  if (logger) {
    return logger
  } else if (!validateLogger(customLogger) && !customLogger) {
    logger = console
  } else {
    logger = customLogger
  }

  return logger
}

export let logger