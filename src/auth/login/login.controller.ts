import { Controller, Get, Headers, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { LoginService } from './login.service';
import { basicAuthDecoder } from 'src/common/funcs/common.func';

/**
 * Handles user authentication requests.
 */
@ApiTags('login')
@Controller('login')
export class LoginController {
  /**
   * Creates an instance of LoginController.
   * @param loginService The login service for authentication logic.
   */
  constructor(private readonly loginService: LoginService) {}

  /**
   * Authenticates a user using Basic Authentication.
   *
   * @param auth The Authorization header containing the Basic Auth credentials.
   * @returns `true` if authentication is successful, otherwise throws an exception.
   * @throws `HttpException` if authentication fails or credentials are missing.
   *
   * @example
   * // Request Example:
   * Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
   */
  @Get()
  @ApiOperation({ summary: 'Authenticate user via Basic Auth' })
  @ApiHeader({
    name: 'Authorization',
    description:
      'Basic Authentication header (Base64 encoded username:password)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful, returns true',
  })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async login(@Headers('Authorization') auth: string): Promise<boolean> {
    try {
      if (!auth) {
        throw new HttpException('Authentication failed', 401);
      }

      let { username, password } = basicAuthDecoder(auth);

      if (!username || !password) {
        [username, password] = auth.split(':');
      }

      return await this.loginService.login(username, password);
    } catch (error) {
      throw error;
    }
  }
}
