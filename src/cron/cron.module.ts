import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { QueueModule } from 'src/common/queue/queue.module';
import { EtaRegisterModule } from 'src/etaRegister/eta.lider.module';
import { MemoryQueueService } from 'src/common/queue/memory.queue.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), QueueModule, EtaRegisterModule],
  providers: [
    CronService,
    {
      provide: 'QUEUE_SERVICE',
      useExisting: MemoryQueueService,
    },
  ],
  exports: [CronService],
})
export class CronModule {}
