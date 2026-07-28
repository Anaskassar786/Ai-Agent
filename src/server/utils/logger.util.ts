/**
 * PROFIT TOOL — Enterprise Structured Logger Utility
 * Provides JSON structured logging with timestamps, severity levels, and audit formatting.
 * Compliant with enterprise observability standards (Document 13B).
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  AUDIT = 'AUDIT'
}

export interface LogContext {
  storeId?: string;
  actorId?: string;
  actorRole?: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any;
}

export class EnterpriseLogger {
  private static formatMessage(level: LogLevel, message: string, context: LogContext = {}): string {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: process.env.NODE_ENV || 'development',
      service: 'profit-tool-backend',
      ...context
    };
    return JSON.stringify(entry);
  }

  public static debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  public static info(message: string, context?: LogContext): void {
    console.info(this.formatMessage(LogLevel.INFO, message, context));
  }

  public static warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  public static error(message: string, error?: any, context?: LogContext): void {
    const errorDetails = error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    } : { errorRaw: String(error) };

    console.error(this.formatMessage(LogLevel.ERROR, message, { ...context, ...errorDetails }));
  }

  public static audit(action: string, context: LogContext): void {
    console.info(this.formatMessage(LogLevel.AUDIT, `AUDIT_EVENT: ${action}`, {
      auditAction: action,
      ...context
    }));
  }
}
