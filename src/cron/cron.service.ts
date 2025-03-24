import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
/**
 * Service responsible for processing tasks in the queue using a cron job.
 */
@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  private readonly cronExpression: string;
  private readonly maxRetries: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.cronExpression = this.configService.get<string>(
      'JOB_CRON_EXPRESSION',
      '0 * * * * *',
    );
    this.maxRetries = this.configService.get<number>('JOB_MAX_RETRIES', 3);
  }

  /**
   * Initialize the cron job dynamically after the module is initialized.
   */
  onModuleInit(): void {
    // Schedule the cron job dynamically using the cron expression
    const job = new CronJob(this.cronExpression, async () => {
      await this.testJob();
    });
    this.schedulerRegistry.addCronJob('testJob', job);
    job.start();
    this.logger.log(
      `Process Job Queue Cron job scheduled with expression: ${this.cronExpression}`,
    );
  }

  async testJob(): Promise<void> {}
}
