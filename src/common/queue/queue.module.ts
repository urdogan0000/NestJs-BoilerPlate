import { Module } from '@nestjs/common';
import { MemoryQueueService } from './memory.queue.service';

@Module({ providers: [MemoryQueueService], exports: [MemoryQueueService] })
export class QueueModule {}
