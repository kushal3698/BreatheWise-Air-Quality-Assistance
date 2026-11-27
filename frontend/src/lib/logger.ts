/**
 * Safe client and server logger utility that suppresses noisy debug warnings in production builds.
 */
export const logger = {
  warn: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
  info: (...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(...args);
    }
  },
};
