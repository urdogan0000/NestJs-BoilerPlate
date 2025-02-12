import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class AuthApiKeyGuard implements CanActivate {
  private readonly liderAuthApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.liderAuthApiKey = this.configService.get<string>('API_KEY') || '';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['api-key'];

    if (!apiKey) {
      throw new HttpException('Unauthorized', 401);
    }

    const providedKeyBuffer = Buffer.from(apiKey);
    const storedKeyBuffer = Buffer.from(this.liderAuthApiKey);

    if (
      providedKeyBuffer.length !== storedKeyBuffer.length ||
      !timingSafeEqual(providedKeyBuffer, storedKeyBuffer)
    ) {
      throw new HttpException('Unauthorized', 401);
    }

    return true;
  }
}
