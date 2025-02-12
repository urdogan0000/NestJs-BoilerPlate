import { Module } from '@nestjs/common';
import { HealthCheckController } from './healthCheck.controller';
import { LoggerService } from 'src/common/logger/winston.logger';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  controllers: [HealthCheckController],
  providers: [LoggerService],
  imports: [TerminusModule],
})
export class HealthCheckModule {}
