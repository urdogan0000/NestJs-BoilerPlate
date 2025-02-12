import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterService } from './register.service';
import { RegisterDto } from './register.dto';

/**
 * Controller responsible for handling user registration.
 */
@ApiTags('register')
@Controller('register')
export class RegisterController {
  /**
   * Creates an instance of RegisterController.
   *
   * @param registerService The service responsible for user registration logic.
   */
  constructor(private readonly registerService: RegisterService) {}

  /**
   * Handles user registration.
   *
   * @param registerDto The registration data transfer object containing user details.
   * @returns The result of the registration process.
   * @throws `HttpException` if the registration fails.
   *
   * @example
   * ```json
   * {
   *   "type": "basic",
   *   "from": "mobile_app",
   *   "password": "securePassword",
   *   "macAddresses": "00:1A:2B:3C:4D:5E",
   *   "hostname": "user-pc",
   *   "userName": "johndoe",
   *   "timestamp": "2025-01-24T12:34:56Z"
   * }
   * ```
   */
  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  async register(@Body() registerDto: RegisterDto): Promise<unknown> {
    try {
      return await this.registerService.register(registerDto);
    } catch (error) {
      throw error;
    }
  }
}
