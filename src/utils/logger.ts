/**
 * Production-ready logging utility
 * Replaces console.log with structured logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as any : undefined
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.formatMessage('debug', message, context);
    this.addToBuffer(entry);
    
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.formatMessage('info', message, context);
    this.addToBuffer(entry);
    
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.formatMessage('warn', message, context);
    this.addToBuffer(entry);
    
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.formatMessage('error', message, context, error);
    this.addToBuffer(entry);
    
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error || '', context || '');
    }

    // In production, you could send errors to a monitoring service
    if (!this.isDevelopment && error) {
      this.reportError(entry);
    }
  }

  private reportError(entry: LogEntry) {
    // TODO: Integrate with error monitoring service (Sentry, LogRocket, etc.)
    // For now, we'll store it locally
    try {
      const errorReport = {
        ...entry,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'anonymous' // Replace with actual user ID when available
      };
      
      // Could send to analytics or error reporting service
      // analytics.track('error', errorReport);
    } catch (e) {
      // Silently fail if error reporting fails
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logBuffer.filter(entry => entry.level === level);
    }
    return [...this.logBuffer];
  }

  clearLogs() {
    this.logBuffer = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, any>) => logger.error(message, error, context)
};