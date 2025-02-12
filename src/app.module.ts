import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './healthCheck/healthCheck.module';
import { LoggerService } from './common/logger/winston.logger';
import { ThrottlerModule } from '@nestjs/throttler';
import { CronModule } from './cron/cron.module';
import { QueueModule } from './common/queue/queue.module';

@Module({
  imports: [
    AuthModule,

    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: configService.get<number>('THROTTLER_TTL', 1000),
          limit: configService.get<number>('THROTTLER_LIMIT', 50),
          blockDuration: configService.get<number>(
            'THROTTLER_BLOCK_DURATION',
            1000,
          ),
        },
      ],
      inject: [ConfigService],
    }),
    // I18nModule setup
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('FALLBACK_LANGUAGE') || 'en',
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
        typesOutputPath: path.join(
          __dirname,
          '../src/generated/i18n.generated.ts',
        ),
      }),
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['x-custom-lang']),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp(),
              winston.format.printf((info) => {
                let { timestamp, level, message, context } = info;
                if (!context) {
                  context = 'LDAP Service';
                }
                return `${timestamp} [${level}] [${context['context'] || context || 'UnknownContext'}]: ${message}`;
              }),
            ),
            // Get NODE_ENV from ConfigService and set log level
            level:
              configService.get<string>('APP_LEVEL') === 'production'
                ? 'info'
                : 'debug',
          }),
          new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'debug',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ],
      }),
    }),
    HealthCheckModule,
    QueueModule,
    CronModule,
  ],
  controllers: [],
  providers: [LoggerService],
  exports: [],
})
export class AppModule {}
