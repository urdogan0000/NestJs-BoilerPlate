import { Injectable } from '@nestjs/common';
import { AuthenticationInterface } from 'src/common/interfaces/authentication.interface';
import { LoggerService } from 'src/common/logger/winston.logger';

/**
 * Service for handling Custom authentication and operations.
 */
@Injectable()
export class SampleAuthService implements AuthenticationInterface {
  /**
   * @param logger - The logger service to log messages.
   */
  constructor(private readonly logger: LoggerService) {}

  /**
   * Authenticates a user with the provided username and password using LDAP.
   * @param username - The username to authenticate.
   * @param password - The password to authenticate.
   * @returns {Promise<boolean>} - Returns true if authentication is successful.
   * @throws {HttpException} - Throws an exception if authentication fails.
   */
  async basicAuth(username: string, password: string): Promise<boolean> {
    let passwordHash = password; // Replace this with the actual password hash
    this.logger.log(
      `Authenticating user ${username}...  HashPassword: ${passwordHash}`,
    ); //for sample log please delete before productions
    return true;
  }
}
