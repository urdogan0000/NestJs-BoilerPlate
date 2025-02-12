import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  HttpException,
} from '@nestjs/common';
import { Client, SearchOptions } from 'ldapts';
import { AuthenticationInterface } from 'src/common/interfaces/authentication.interface';
import { loadConfig } from '../common/funcs/common.func';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/winston.logger';

/**
 * Service for handling LDAP authentication and operations.
 */
@Injectable()
export class LdapService
  implements OnModuleInit, OnModuleDestroy, AuthenticationInterface
{
  private client: Client;
  private filePath: string;
  private fileName: string;
  private configMap: Map<string, string> = new Map();

  /**
   * Creates an instance of the LdapService.
   * @param configService - The configuration service to retrieve app settings.
   * @param logger - The logger service to log messages.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const isProduction = configService.get('APP_LEVEL') === 'production';
    this.logger.setContext(LdapService.name);
    this.filePath = isProduction
      ? configService.get('LDAP_CONF_FILE_PATH')
      : __dirname;
    this.fileName =
      configService.get('LDAP_CONF_FILE_NAME') || 'ldap-config.txt';

    if (isProduction) {
      this.logger.log(`App start with ${this.configService.get('APP_LEVEL')}`);
    }

    // Load the configuration file
    loadConfig(this.configMap, this.fileName, this.filePath);
  }

  /**
   * Initializes the LDAP client and binds as an admin user when the module is initialized.
   */
  async onModuleInit(): Promise<void> {
    await this.createLdapClient();
    await this.bindAdmin();
  }

  /**
   * Creates the LDAP client using the URL from the configuration.
   * Throws an exception if the LDAP URL is not provided.
   */
  private async createLdapClient(): Promise<void> {
    const ldapUrl = await this.configMap.get('LDAP_URL');

    if (!ldapUrl) {
      throw new HttpException(
        'LDAP_URL is not provided in the configuration',
        400,
      );
    }

    this.client = new Client({
      url: ldapUrl,
      timeout: 15000,
      connectTimeout: 15000,
    });
  }

  /**
   * Binds to the LDAP server using admin credentials from the configuration.
   * Logs success or failure of the binding process.
   */
  private async bindAdmin(): Promise<void> {
    try {
      await this.client.bind(
        this.configMap.get('LDAP_BIND_DN'),
        this.configMap.get('LDAP_BIND_PASSWORD'),
      );
      this.logger.log(`trying to bind to LDAP as admin`);
      this.logger.log('Successfully connected to LDAP as admin');
    } catch (err) {
      this.logger.error(`Failed to bind to LDAP as admin: ${err}`);
      throw new Error('LDAP admin bind failed');
    }
  }

  /**
   * Authenticates a user with the provided username and password using LDAP.
   * @param username - The username to authenticate.
   * @param password - The password to authenticate.
   * @returns {Promise<boolean>} - Returns true if authentication is successful.
   * @throws {HttpException} - Throws an exception if authentication fails.
   */
  async basicAuth(username: string, password: string): Promise<boolean> {
    const searchOptions: SearchOptions = {
      filter: `(${this.configMap.get('LDAP_USERNAME_ATTRIBUTE')}=${username})`,
      scope: 'sub',
      attributes: ['userPassword', 'dn'],
    };

    this.logger.log(`Searching for user with filter: ${searchOptions.filter}`);

    try {
      const { searchEntries } = await this.client.search(
        this.configMap.get('LDAP_SEARCH_BASE'),
        searchOptions,
      );

      const user = searchEntries.filter(
        (entry) => entry.userPassword === password,
      );

      if (!user?.length) {
        throw new HttpException('Invalid username or password', 401);
      }

      return true;
    } catch (error) {
      this.logger.error(`LDAP error: ${error}`);
      throw error; // Authentication failed
    }
  }

  /**
   * Cleans up the LDAP client connection when the module is destroyed.
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.unbind();
      this.logger.log('LDAP connection closed successfully');
    } catch (err) {
      this.logger.error(`Error unbinding LDAP client: ${err}`);
    }
  }
}
