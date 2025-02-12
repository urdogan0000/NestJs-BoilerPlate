import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';

/**
 * HealthCheckController provides a health check endpoint to verify the status of the application.
 * This endpoint returns a status of 'ok' when the application is running properly.
 */
@ApiTags('health')
@Controller('health')
export class HealthCheckController {
  /**
   * Health check endpoint to verify the application is running.
   * Responds with a status of 'ok' and a status code of 200 if the application is healthy.
   *
   * @returns An object containing the status and statusCode.
   * @example { status: 'ok', statusCode: 200 }
   */
  @ApiOperation({
    summary: 'Health check endpoint to verify the application is running',
  })
  @ApiResponse({
    status: 200,
    description: 'The application is healthy and running',
    schema: {
      example: { status: 'ok', statusCode: 200 },
    },
  })
  @Get()
  @HealthCheck()
  healthCheck(): { status: string; statusCode: number } {
    return { status: 'ok', statusCode: 200 };
  }
}
