import { Injectable, Logger } from '@nestjs/common';
import { QueueInterface } from '../interfaces/queue.interface';
import { Job } from '../types/job.type';
import { JobData } from '../types/job.data.type';
import * as crypto from 'crypto';

/**
 * A service that implements a simple in-memory queue system.
 *
 * This service allows adding, retrieving, removing, and checking jobs in a queue.
 * It also supports updating jobs (e.g., for retry logic) and ensures jobs are uniquely identified.
 */
@Injectable()
export class MemoryQueueService implements QueueInterface {
  private readonly queues = new Map<string, Job[]>();
  private readonly logger = new Logger(MemoryQueueService.name);

  /**
   * Adds a job to the specified queue with retries and delay.
   *
   * @param {string} queueName - The name of the queue to add the job to.
   * @param {JobData} jobData - The data associated with the job.
   * @param {number} [retries=3] - The number of retries allowed for the job (default is 3).
   * @param {number} [delay=0] - The delay before the job is processed (default is 0).
   *
   * @returns {Promise<void>} - A promise that resolves when the job is added.
   *
   * @example
   * const jobData = { process: 'UPDATE', targetRequestDomain: 'LIDER', data: { macAddress: '00:11:22:33:44:55' }};
   * await memoryQueueService.addJob('eta-lider-task', jobData);
   */
  async addJob(
    queueName: string,
    jobData: JobData,
    retries: number = 3,
    delay: number = 0,
  ): Promise<void> {
    const job = this.createJob(queueName, jobData, retries, delay);
    const queue = this.getQueue(queueName);

    if (await this.hasJob(queueName, job.id)) {
      this.logger.warn(`Job already exists: ${job.id}`);
      return;
    }

    queue.push(job);
    this.logger.log(`Added job: ${JSON.stringify(jobData)}`);
  }

  /**
   * Retrieves the next job in the queue or null if the queue is empty.
   *
   * @param {string} queueName - The name of the queue to retrieve the job from.
   *
   * @returns {Promise<Job | null>} - A promise that resolves with the next job or null if the queue is empty.
   *
   * @example
   * const nextJob = await memoryQueueService.getNextJob('eta-lider-task');
   * console.log(nextJob); // Outputs the next job or null if no jobs are available
   */
  async getNextJob(queueName: string): Promise<Job | null> {
    const queue = this.getQueue(queueName);

    if (queue.length === 0) {
      this.logger.debug(`Queue "${queueName}" is empty.`);
      return null;
    }

    return queue[0];
  }

  /**
   * Removes the next job from the specified queue after processing.
   *
   * @param {string} queueName - The name of the queue from which the job will be dequeued.
   *
   * @returns {Promise<void>} - A promise that resolves once the job has been dequeued.
   *
   * @example
   * await memoryQueueService.dequeueJob('eta-lider-task');
   * console.log('Job dequeued');
   */
  async dequeueJob(queueName: string, jobId: string): Promise<void> {
    // Fetch the queue by queueName
    const queue = await this.getQueue(queueName);

    // Find the index of the job with the specified jobId
    const jobIndex = queue.findIndex((job) => job.id === jobId);

    // Check if the job exists
    if (jobIndex !== -1) {
      // Remove the job from the queue using splice
      queue.splice(jobIndex, 1);
      this.logger.log(`Dequeued job with ID "${jobId}" from "${queueName}"`);
    } else {
      this.logger.warn(
        `Job with ID "${jobId}" not found in queue "${queueName}"`,
      );
    }
  }

  /**
   * Checks if the job exists in the specified queue.
   *
   * @param {string} queueName - The name of the queue to check.
   * @param {string} jobId - The unique identifier of the job to check.
   *
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the job exists in the queue, otherwise `false`.
   *
   * @example
   * const jobExists = await memoryQueueService.hasJob('eta-lider-task', 'job-id-123');
   * console.log(jobExists); // Outputs true if the job exists, otherwise false
   */
  async hasJob(queueName: string, jobId: string): Promise<boolean> {
    const queue = this.getQueue(queueName);
    return queue.some((job) => job.id === jobId);
  }
  /**
   * Updates an existing job in the specified queue with partial data.
   *
   * @param {string} queueName - The name of the queue where the job exists.
   * @param {string} jobId - The unique identifier of the job to be updated.
   * @param {Partial<Job>} updatedJobData - The updated job data (partial update).
   *
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the job was updated successfully, or `false` if the job was not found.
   *
   * @example
   * const updatedData = { retries: 5, data: { macAddress: '00:11:22:33:44:55' } };
   * const success = await queueService.updateJob('eta-lider-task', 'job-id-123', updatedData);
   * console.log(success); // Outputs true if the job was updated, otherwise false
   */
  async updateJob(
    queueName: string,
    jobId: string,
    updatedJobData: Partial<Job>,
  ): Promise<boolean> {
    const queue = this.getQueue(queueName);
    const jobIndex = queue.findIndex((job) => job.id === jobId);

    if (jobIndex === -1) {
      this.logger.warn(`Job not found: ${jobId}, unable to update.`);
      return false;
    }

    // Merge existing job data with the updated data
    queue[jobIndex] = { ...queue[jobIndex], ...updatedJobData };

    this.logger.debug(`Updated job: ${JSON.stringify(queue[jobIndex])}`);
    return true;
  }

  /**
   * Generates a unique job ID based on job data.
   *
   * @param {string} queueName - The name of the queue to generate the job ID for.
   * @param {JobData} jobData - The data associated with the job.
   *
   * @returns {string} - A unique job ID string.
   *
   * @example
   * const jobId = memoryQueueService.generateJobId('eta-lider-task', jobData);
   * console.log(jobId); // Outputs the unique job ID for the given job data
   */
  private generateJobId(queueName: string, jobData: JobData): string {
    const jobDataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(jobData))
      .digest('hex');
    return `${queueName}-${jobData.process}-${jobData.targetRequestDomain}-${jobData.data.macAddress}-${jobDataHash}`;
  }

  /**
   * Creates a job object.
   *
   * @param {string} queueName - The name of the queue to create the job for.
   * @param {JobData} jobData - The data associated with the job.
   * @param {number} retries - The number of retries allowed for the job.
   * @param {number} delay - The delay before the job is processed.
   *
   * @returns {Job} - A job object that can be added to the queue.
   *
   * @example
   * const job = memoryQueueService.createJob('eta-lider-task', jobData, 3, 0);
   * console.log(job); // Outputs the created job object
   */
  private createJob(
    queueName: string,
    jobData: JobData,
    retries: number,
    delay: number,
  ): Job {
    return {
      id: this.generateJobId(queueName, jobData),
      data: jobData,
      retries,
      delay,
      timestamp: Date.now(),
    };
  }

  /**
   * Retrieves the queue or initializes it if not present.
   *
   * @param {string} queueName - The name of the queue to retrieve.
   *
   * @returns {Job[]} - The queue associated with the specified name.
   *
   * @example
   * const queue = memoryQueueService.getQueue('eta-lider-task');
   * console.log(queue); // Outputs the queue array
   */
  public getQueue(queueName: string): Job[] {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
    return this.queues.get(queueName);
  }
}
