/**
 * Logging utility for production-safe logging
 * Only logs in development environment to prevent console pollution in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args); // eslint-disable-line no-console
    }
  },

  /**
   * Log error messages (only in development)
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args); // eslint-disable-line no-console
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args); // eslint-disable-line no-console
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args); // eslint-disable-line no-console
    }
  },

  /**
   * Log with custom level (only in development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args); // eslint-disable-line no-console
    }
  },
};

export default logger;