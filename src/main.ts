import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  ValidationPipe,
  HttpStatus,
  ArgumentsHost,
  ValidationError,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './common/exceptionFilters/global.exception.filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  I18nMiddleware,
  I18nService,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { readFileSync, existsSync } from 'fs';
import { LoggingInterceptor } from './common/interceptors/logging.inteceptor';
import { LoggerService } from './common/logger/winston.logger';
import { APP_LEVELS } from './common/enum/app.lvl.enum';

/**
 * Interface for application configuration settings.
 */
interface AppConfig {
  /**
   * Flag indicating whether SSL is enabled.
   * If true, SSL will be used to encrypt communication.
   * If false, the application will run over HTTP.
   */
  SSL_ENABLED: boolean;
  /**
   * Flag indicating whether SSL is enabled.
   * If true, SSL will be used to encrypt communication.
   * If false, the application will run over HTTP.
   */
  SSL_KEY_PATH: string;
  /**
   * Flag indicating whether SSL is enabled.
   * If true, SSL will be used to encrypt communication.
   * If false, the application will run over HTTP.
   */
  SSL_CERT_PATH: string;
  /**
   * Flag indicating whether SSL is enabled.
   * If true, SSL will be used to encrypt communication.
   * If false, the application will run over HTTP.
   */
  APP_LEVEL: string;
  /**
   * Port on which the application will listen for incoming HTTP/HTTPS requests.
   */
  APP_PORT: number;
}

/**
 * Interface for formatted validation errors.
 */
interface FormattedError {
  /**
   * The field that caused the validation error.
   */
  field: string;
  /**
   * A list of error messages related to the field.
   */
  errors: string[];
}

/**
 * Bootstraps the NestJS application.
 * - Loads configuration values.
 * - Sets up HTTPS if enabled.
 * - Configures middleware, global pipes, exception filters, and interceptors.
 * - Initializes Swagger documentation.
 * - Starts the application on the specified port.
 */
async function bootstrap(): Promise<void> {
  let appOptions: { httpsOptions?: { key: Buffer; cert: Buffer } } = {};
  const configService = new ConfigService<AppConfig>();

  const isSslEnabled =
    configService.get<string>('SSL_ENABLED', 'false').toLowerCase() === 'true';

  if (isSslEnabled) {
    const keyPath = configService.get<string>(
      'SSL_KEY_PATH',
      '/etc/ssl/certs/server.key.pem',
    );
    const certPath = configService.get<string>(
      'SSL_CERT_PATH',
      '/etc/ssl/certs/server.cert.pem',
    );

    if (!existsSync(keyPath) || !existsSync(certPath)) {
      throw new Error(
        `SSL is enabled, but key or certificate file is missing at ${keyPath} or ${certPath}.`,
      );
    }

    console.warn('SSL is enabled. Using HTTPS.');
    appOptions.httpsOptions = {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    };
  } else {
    console.warn('SSL is not enabled. Using HTTP.');
  }

  /**
   * Creates the NestJS application instance.
   */
  const app = await NestFactory.create(AppModule, appOptions);

  // Middleware setup
  app.use(I18nMiddleware);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          frameSrc: ["'none'"],
        },
      },
    }),
  );

  // Enables trust proxy for Express
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  app.use(cookieParser());
  app.use(compression());

  /**
   * Configures CORS settings for the application.
   */
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  /**
   * Sets up Swagger API documentation.
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS-Boilerplate')
    .setDescription('NestJS-Boilerplate API documentation')
    .setVersion('1.0')
    .addBasicAuth({ type: 'http', scheme: 'basic' }) // Basic Authentication
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  if (configService.get<string>('APP_LEVEL') !== APP_LEVELS.PRODUCTION) {
    SwaggerModule.setup('api', app, swaggerDocument);
  }

  /**
   * Sets up global validation pipe with strict rules.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  /**
   * Registers global exception filters, including i18n validation handling.
   */
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
      errorFormatter: (
        errors: ValidationError[],
      ): { field: string; errors: string[] }[] =>
        errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        })),
      responseBodyFormatter: (
        host: ArgumentsHost,
        exception: Error,
        formattedErrors: FormattedError[],
      ): {
        statusCode: number;
        message: string;
        timestamp: string;
        path: string;
        language: string;
        errors: { field: string; errors: string[] }[];
      } => {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();

        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: exception.message,
          timestamp: new Date().toISOString(),
          path: request.url,
          language: request.i18nLang || 'en',
          errors: formattedErrors,
        };
      },
    }),
    new GlobalExceptionFilter(app.get(I18nService)),
  );

  /**
   * Configures logging using a global interceptor.
   */
  const logger = app.get(LoggerService);
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  /**
   * Starts the application on the configured port.
   */
  const port = configService.get<number>('APP_PORT', 3000);
  await app.listen(port, '0.0.0.0');
  console.warn(
    `Application is running on: ${isSslEnabled ? 'https' : 'http'}://localhost:${port}`,
  );
}

/**
 * Immediately invokes the bootstrap function to start the application.
 */
(async (): Promise<void> => {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Error during app bootstrap:', error);
    process.exit(1); // Optionally handle the error by exiting the process
  }
})();
