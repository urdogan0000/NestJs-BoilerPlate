import { Module } from '@nestjs/common';
import { LoginService } from './login/login.service';
import { LoginController } from './login/login.controller';
import { ConfigModule } from '@nestjs/config';

import { LdapService } from 'src/ldap/ldap.service';
import { RegisterController } from './register/register.controller';
import { RegisterService } from './register/register.service';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from 'src/common/logger/winston.logger';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [LoginController, RegisterController],
  providers: [
    LoggerService,
    LoginService,
    RegisterService,
    {
      provide: 'AUTH_SERVICE',
      useClass: LdapService, // You can replace this with any other service that implements AuthenticationInterface
    },
  ],
  exports: [LoginService],
})
export class AuthModule {}
