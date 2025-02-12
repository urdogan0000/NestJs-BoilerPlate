import { Inject, Injectable } from '@nestjs/common';
import { AuthenticationInterface } from 'src/common/interfaces/authentication.interface';
import { LoggerService } from 'src/common/logger/winston.logger';

/**
 * Service responsible for handling user authentication.
 */
@Injectable()
export class LoginService {
  /**
   * Creates an instance of LoginService.
   *
   * @param authService The authentication service implementing `AuthenticationInterface`.
   * @param logger The logger service for logging authentication events.
   */
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthenticationInterface,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LoginService.name);
  }

  /**
   * Authenticates a user via Basic Authentication.
   *
   * @param username The username of the user.
   * @param password The user's password.
   * @returns `true` if authentication is successful, otherwise `false`.
   *
   * @example
   * ```typescript
   * const isAuthenticated = await loginService.login('john.doe', 'securePassword');
   * console.log(isAuthenticated); // true or false
   * ```
   */
  async login(username: string, password: string): Promise<boolean> {
    const isValid = await this.authService.basicAuth(username, password);
    this.logger.log(`The user with username /${username}/ login is ${isValid}`);

    return isValid;
  }
}
