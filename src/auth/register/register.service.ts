import { Injectable } from '@nestjs/common';
import { RegisterDto } from './register.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { LIDER_ENDPOINTS } from 'src/common/enum/lider.endpoints.enum';
import { LoggerService } from 'src/common/logger/winston.logger';

/**
 * Service responsible for handling user registration.
 */
@Injectable()
export class RegisterService {
  private readonly context = RegisterService.name;

  /**
   * Initializes the RegisterService.
   *
   * @param logger Logger service for logging messages.
   * @param httpService HTTP service for making requests.
   * @param configService Configuration service for environment variables.
   */
  constructor(
    private readonly logger: LoggerService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(RegisterService.name);
  }

  /**
   * Handles user registration and sends a POST request to the LIDER API.
   *
   * @param registerDto The registration details provided by the user.
   * @returns The response from the LIDER API.
   * @throws Will throw an error if the registration request fails.
   *
   * @example
   * ```typescript
   * const registerDto: RegisterDto = {
   *   type: 'basic',
   *   from: 'mobile_app',
   *   userName: 'johndoe',
   *   password: 'securePassword',
   * };
   * const response = await registerService.register(registerDto);
   * console.log(response);
   * ```
   */
  async register(registerDto: RegisterDto): Promise<unknown> {
    const registerUrl =
      (await this.configService.get<string>('LIDER_URL')) +
      LIDER_ENDPOINTS.REGISTER;

    // Logging the registration URL
    this.logger.log(`Registering with URL: ${registerUrl}`);

    // Sending HTTP POST request
    const response$ = this.httpService.post(registerUrl, registerDto);
    const response = await lastValueFrom(response$);

    // Logging successful response
    this.logger.log('Registration successful');

    return response.data;
  }
}
