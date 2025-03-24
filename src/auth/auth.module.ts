import { Module } from '@nestjs/common';
import { LoginService } from './login/login.service';
import { LoginController } from './login/login.controller';
import { ConfigModule } from '@nestjs/config';

import { HttpModule } from '@nestjs/axios';
import { LoggerService } from 'src/common/logger/winston.logger';
import { SampleAuthService } from './sample.auth.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [LoginController],
  providers: [
    LoggerService,
    LoginService,
    {
      provide: 'AUTH_SERVICE',
      useClass: SampleAuthService, // You can replace this with any other service that implements AuthenticationInterface
    },
  ],
  exports: [LoginService],
})
export class AuthModule {}
