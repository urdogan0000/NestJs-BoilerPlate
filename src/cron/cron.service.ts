import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES_ENUM } from 'src/common/enum/queue.names.enum';
import { QueueInterface } from 'src/common/interfaces/queue.interface';
import { PlatformType } from 'src/etaRegister/dtos/school.query.dto';
import { UpdateEtaSchoolDto } from 'src/etaRegister/dtos/update.eta.school.dto';
import { EtaLiderService } from 'src/etaRegister/eta.lider.service';
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
    @Inject('QUEUE_SERVICE') private readonly queueService: QueueInterface,
    private readonly etaLiderService: EtaLiderService,
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
      await this.processQueue();
    });
    this.schedulerRegistry.addCronJob('processJobQueue', job);
    job.start();
    this.logger.log(
      `Process Job Queue Cron job scheduled with expression: ${this.cronExpression}`,
    );
  }

  /**
   * Process the queue and handle retries for failed jobs.
   */
  async processQueue(): Promise<void> {
    this.logger.debug('Processing queue');
    const queueName = QUEUE_NAMES_ENUM.ETA_LIDER_TASK;

    const queue = await this.queueService.getQueue(queueName);

    if (queue.length === 0) {
      this.logger.log('No jobs found in the queue.');
      return;
    }

    for (let index = 0; index < queue.length; index++) {
      try {
        this.logger.log(`Processing job: ${JSON.stringify(queue[index].data)}`);

        // Process the job based on the type of process
        if (queue[index].data.process === 'GET') {
          await this.etaLiderService.getSchoolByMacAddress(
            queue[index].data?.data['macAddress'],
            queue[index].data.targetRequestDomain,
          );
        } else {
          if (queue[index].data.targetRequestDomain === PlatformType.ETA) {
            await this.etaLiderService.updateEtaSchoolInfoByMacAddress(
              queue[index].data.data as UpdateEtaSchoolDto,
            );
          } else {
            await this.etaLiderService.updateLiderSchoolByMacAddress(
              queue[index].data.data,
            );
          }
        }

        await this.queueService.dequeueJob(queueName, queue[index].id);
        this.logger.log(
          `Successfully processed and removed job: ${queue[index].id}`,
        );
      } catch (error) {
        this.logger.error(`Error processing job: ${error.message}`);

        if (queue[index].retries > 0) {
          queue[index].retries--;
          await this.queueService.updateJob(queueName, queue[index].id, {
            retries: queue[index].retries,
          });
          this.logger.warn(
            `Retrying job in next cron execution. Remaining retries: ${queue[index].retries}`,
          );
        } else {
          this.logger.error(
            `Max retries reached, removing job: ${queue[index].id}`,
          );
          await this.queueService.dequeueJob(queueName, queue[index].id);
        }
      }
    }
  }
}
