import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/**
 * DTO for user registration requests.
 */
export class RegisterDto {
  /**
   * The type of registration.
   * @example "basic"
   */
  @ApiPropertyOptional({})
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  @IsString()
  type: string;

  /**
   * The origin of the registration request (optional).
   * @example "mobile_app"
   */
  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  from?: string;

  /**
   * The password for registration (optional).
   */
  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  password?: string;

  /**
   * Additional registration details (optional).
   */
  @ApiPropertyOptional()
  @IsOptional()
  data?: unknown;

  /**
   * MAC addresses associated with the user (optional).
   * @example "00:1A:2B:3C:4D:5E"
   */
  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  macAddresses?: string;

  /**
   * IP addresses of the user (optional, write-only).
   * @example "192.168.1.1"
   */
  @ApiPropertyOptional({
    writeOnly: true,
  })
  @IsOptional()
  @IsString()
  ipAddresses?: string;

  /**
   * The hostname of the user's device (optional).
   * @example "user-pc"
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hostname?: string;

  /**
   * Username for registration (optional, write-only).
   * @example "johndoe"
   */
  @ApiPropertyOptional({
    writeOnly: true,
  })
  @IsOptional()
  @IsString()
  userName?: string;

  /**
   * The user password (optional, write-only).
   */
  @ApiPropertyOptional({
    writeOnly: true,
  })
  @IsOptional()
  @IsString()
  userPassword?: string;

  /**
   * Timestamp of the registration request (optional).
   * @example "2025-01-24T12:34:56Z"
   */
  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  timestamp?: string;
}
