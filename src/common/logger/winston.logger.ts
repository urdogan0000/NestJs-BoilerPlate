import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * Service for logging messages using the Winston logger.
 * Provides various logging levels such as info, debug, warn, and error.
 */
@Injectable()
export class LoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Sets the context for the logger. This is usually used to specify
   * the module or class where the log is coming from.
   *
   * @param context The context string to associate with the logs.
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Logs a message with the default logging level (usually 'info').
   *
   * @param message The message to log.
   */
  log(message: string): void {
    this.logger.log(message, { context: this.context });
  }

  /**
   * Logs an informational message.
   *
   * @param message The informational message to log.
   */
  info(message: string): void {
    this.logger.info(message, { context: this.context });
  }

  /**
   * Logs a debug message. These are usually verbose logs meant for development.
   *
   * @param message The debug message to log.
   */
  debug(message: string): void {
    this.logger.debug(message, { context: this.context });
  }

  /**
   * Logs a warning message. These messages indicate potential issues.
   *
   * @param message The warning message to log.
   */
  warn(message: string): void {
    this.logger.warn(message, { context: this.context });
  }

  /**
   * Logs an error message. Optionally includes a trace of the error.
   *
   * @param message The error message to log.
   * @param trace (Optional) The stack trace to log with the error message.
   */
  error(message: string, trace?: string): void {
    this.logger.error(message, { context: this.context, trace });
  }
}
