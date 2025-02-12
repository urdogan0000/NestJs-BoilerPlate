import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Inject } from '@nestjs/common';
import { getClientIp } from '../funcs/common.func';
import { LoggerService } from '../logger/winston.logger';

/**
 * Interface representing the structure of the log object for both incoming requests and outgoing responses.
 */
interface LogObject {
  /**
   * The timestamp of the request or response.
   * @example '2025-01-24T12:34:56.789Z'
   */
  timestamp: string;

  /**
   * The real IP address of the client making the request.
   * @example '192.168.1.1'
   */
  realIp: string;

  /**
   * The HTTP method of the request (GET, POST, etc.).
   * @example 'GET'
   */
  method: string;

  /**
   * The URL path of the request.
   * @example '/api/users'
   */
  requestUrl: string;

  /**
   * The user agent string from the request headers.
   * @example 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
   */
  userAgent: string;

  /**
   * The language preference from the request headers.
   * @example 'en-US'
   */
  language: string;

  /**
   * The headers from the request, with sensitive information removed.
   * @example { 'accept': 'application/json', 'host': 'example.com' }
   */
  headers: Record<string, string>;

  /**
   * The body of the request, with sensitive fields sanitized.
   * @example { 'username': 'user1', 'password': '****' }
   */
  body: Record<string, unknown> | string;

  /**
   * The response time, measured in milliseconds.
   * @example '123ms'
   */
  responseTime?: string;

  /**
   * The response data, with sensitive information removed.
   * @example { 'status': 'success', 'data': { ... } }
   */
  response?: Record<string, unknown> | string;
}

/**
 * LoggingInterceptor is a NestJS interceptor responsible for logging incoming and outgoing HTTP requests.
 * - Logs request details such as IP, method, headers, body, and response.
 * - Sanitizes sensitive information from headers, request body, and response.
 * - Measures and logs response time.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * Logger service used to log the request and response details.
   */
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  /**
   * Intercepts the incoming request, logs its details, and measures the response time.
   * Logs the outgoing response and any associated response data.
   *
   * @param context The execution context of the request.
   * @param next The next handler in the pipeline.
   * @returns An observable stream containing the response data.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const realIp = getClientIp(request);
    const requestUrl = request.url;
    const timestamp = new Date().toISOString();
    const language = request.headers['accept-language'] || 'en';
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const method = request.method;

    // Skip logging for health check URLs
    if (request.url.includes('health')) {
      return next.handle();
    }

    const start = Date.now();

    const logObject: LogObject = {
      timestamp,
      realIp,
      method,
      requestUrl,
      userAgent,
      language,
      headers: this.sanitizeHeaders(request.headers),
      body: this.sanitizeBody(request.body),
    };

    this.logger.log(`Incoming Request: ${JSON.stringify(logObject)}`);

    return next.handle().pipe(
      tap((data: unknown) => {
        const responseTime = `${Date.now() - start}ms`;

        const responseLog: LogObject = {
          ...logObject,
          responseTime,
        };

        try {
          responseLog.response = this.sanitizeResponse(data);
        } catch (error) {
          responseLog.response = { error: 'Unable to process response' };
          this.logger.error('Error sanitizing response:', error);
        }

        this.logger.log(`Outgoing Response: ${JSON.stringify(responseLog)}`);
      }),
    );
  }

  /**
   * Sanitizes request headers by removing sensitive information like 'authorization' and 'cookie'.
   *
   * @param headers The request headers to sanitize.
   * @returns A sanitized headers object.
   */
  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, string> {
    const sanitizedHeaders: Record<string, string> = {};

    Object.entries(headers).forEach(([key, value]) => {
      if (!['authorization', 'cookie'].includes(key.toLowerCase())) {
        sanitizedHeaders[key] = Array.isArray(value)
          ? value.join(', ')
          : String(value);
      }
    });

    return sanitizedHeaders;
  }

  /**
   * Sanitizes the request body by removing sensitive fields like 'password' and 'token'.
   *
   * @param body The request body to sanitize.
   * @returns A sanitized body object or the original body if not an object.
   */
  private sanitizeBody(body: unknown): Record<string, unknown> | string {
    if (!body || typeof body !== 'object') return body as string;
    const sanitizedBody = { ...body } as Record<string, unknown>;
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    return sanitizedBody;
  }

  /**
   * Sanitizes the response data by removing sensitive fields like 'token'.
   *
   * @param response The response data to sanitize.
   * @returns A sanitized response object or the original response if not an object.
   */
  private sanitizeResponse(
    response: unknown,
  ): Record<string, unknown> | string {
    if (!response || typeof response !== 'object') return response as string;
    const sanitizedResponse = { ...response } as Record<string, unknown>;
    delete sanitizedResponse.token;
    return sanitizedResponse;
  }
}
