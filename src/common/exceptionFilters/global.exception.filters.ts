import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { Logger } from '@nestjs/common';
import { getClientIp } from 'src/common/funcs/common.func';

/**
 * Global exception filter that handles all exceptions thrown within the app.
 * - Catches exceptions of type `HttpException` or `Error`.
 * - Translates error messages using the `I18nService` based on the current language.
 * - Logs detailed information about the error and request.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly i18n: I18nService<I18nTranslations>) {}

  /**
   * Handles caught exceptions.
   * - Determines the status code and message based on the exception type.
   * - Logs detailed information about the error.
   * - Sends a structured error response in JSON format.
   *
   * @param exception The exception that was thrown.
   * @param host The context of the exception, including the request and response objects.
   */
  async catch(
    exception: HttpException | Error,
    host: ArgumentsHost,
  ): Promise<void> {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Ignore favicon.ico requests
    if (request.url === '/favicon.ico') {
      return response.status(HttpStatus.NO_CONTENT).send();
    }

    // Determine the status code and error message
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException && exception.getResponse
        ? exception.getResponse()
        : 'An unexpected error occurred';

    let message =
      exception instanceof HttpException && exception.message
        ? exception.message
        : 'An unexpected error occurred';

    const i18nLang = request.i18nLang || 'en';

    // Translate the error message based on the status code
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        message = await this.i18n.translate('response.BAD_REQUEST', {
          lang: i18nLang,
          defaultValue: 'Bad Request',
        });
        break;
      case HttpStatus.UNAUTHORIZED:
        message = await this.i18n.translate('response.UNAUTHORIZED', {
          lang: i18nLang,
          defaultValue: 'Unauthorized Access',
        });
        break;
      case HttpStatus.FORBIDDEN:
        message = await this.i18n.translate('response.FORBIDDEN', {
          lang: i18nLang,
          defaultValue: 'Access Forbidden',
        });
        break;
      case HttpStatus.NOT_FOUND:
        message = await this.i18n.translate('response.NOT_FOUND', {
          lang: i18nLang,
          defaultValue: 'Resource Not Found',
        });
        break;
      case HttpStatus.TOO_MANY_REQUESTS:
        message = await this.i18n.translate('response.TOO_MANY_REQUESTS', {
          lang: i18nLang,
          defaultValue: 'Too Many Requests',
        });
        break;
      default:
        message = await this.i18n.translate('response.INTERNAL_SERVER_ERROR', {
          lang: i18nLang,
          defaultValue: 'Internal Server Error',
        });
        break;
    }

    // Get the client's real IP address
    const realIp = getClientIp(request);

    // Log the exception details
    const logInfo = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      ip: request.ip,
      realIp,
      body: request.body,
      statusCode: status,
      error: exceptionResponse,
    };

    this.logger.warn('Exception Caught', logInfo);

    // Send the structured error response to the client
    const responseJson = {
      statusCode: status,
      error: exceptionResponse,
      message,
      timestamp: logInfo.timestamp,
      path: request.url,
      language: i18nLang,
    };

    response.status(status).json(responseJson);
  }
}
