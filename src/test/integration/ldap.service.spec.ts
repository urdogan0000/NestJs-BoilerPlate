import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LdapService } from 'src/ldap/ldap.service';
import { LoggerService } from 'src/common/logger/winston.logger';

describe('LdapService Integration Test', () => {
  let ldapService: LdapService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(), // Ensure ConfigModule is initialized
        WinstonModule.forRoot({
          transports: [
            new winston.transports.Console({
              format: winston.format.simple(),
            }),
          ],
        }),
      ],
      providers: [LdapService, LoggerService],
    }).compile();

    ldapService = module.get<LdapService>(LdapService);

    // Initialize LDAP client and bind admin
    await ldapService.onModuleInit();
  });

  // it('should bind to LDAP as admin successfully', async () => {
  //   await expect(ldapService.basicAuth('', '')).resolves.toBe(false);
  // });

  it('should throw 401 error for invalid credentials', async () => {
    await expect(
      ldapService.basicAuth('invalidUser', 'wrongPassword'),
    ).rejects.toThrow('Invalid username or password');
  });

  afterAll(async () => {
    await ldapService.onModuleDestroy();
  });
});
