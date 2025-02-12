import { JobData } from '../types/job.data.type';
import { Job } from '../types/job.type';

/**
 * Interface representing a queue service.
 *
 * This interface defines the necessary methods for interacting with a queue system, including adding jobs,
 * retrieving the next job, dequeuing jobs, and checking whether a specific job exists in the queue.
 */
export interface QueueInterface {
  /**
   * Adds a job to the specified queue.
   *
   * @param {string} queueName - The name of the queue to which the job will be added.
   * @param {JobData} jobData - The data associated with the job. It contains information such as the process and target request domain.
   * @param {number} [retries=3] - The number of times the job can be retried in case of failure (optional, default is 3).
   * @param {number} [delay=0] - The delay before the job is processed (optional, default is 0).
   *
   * @returns {Promise<void>} - A promise that resolves once the job has been added to the queue.
   *
   * @example
   * const jobData = { process: 'UPDATE', targetRequestDomain: 'LIDER', data: { macAddress: '00:11:22:33:44:55' }};
   * queueService.addJob('eta-lider-task', jobData);
   */
  addJob(
    queueName: string,
    jobData: JobData,
    retries?: number,
    delay?: number,
  ): Promise<void>;

  /**
   * Retrieves the next job from the specified queue.
   *
   * @param {string} queueName - The name of the queue from which the job will be retrieved.
   *
   * @returns {Promise<Job | null>} - A promise that resolves to the next job in the queue, or null if no jobs are left.
   *
   * @example
   * const nextJob = await queueService.getNextJob('eta-lider-task');
   * console.log(nextJob); // Outputs the next job or null if no jobs are available
   */
  getNextJob(queueName: string): Promise<Job | null>;

  /**
   * Removes the next job from the specified queue.
   *
   * @param {string} queueName - The name of the queue from which the job will be dequeued.
   *
   * @returns {Promise<void>} - A promise that resolves once the job has been dequeued.
   *
   * @example
   * await queueService.dequeueJob('eta-lider-task');
   * console.log('Job dequeued');
   */
  dequeueJob(queueName: string, jobId: string): Promise<void>;

  /**
   * Checks whether a job with the specified job ID exists in the queue.
   *
   * @param {string} queueName - The name of the queue to check.
   * @param {string} jobId - The unique identifier of the job to check.
   *
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the job exists in the queue, or `false` otherwise.
   *
   * @example
   * const jobExists = await queueService.hasJob('eta-lider-task', 'job-id-123');
   * console.log(jobExists); // Outputs true if the job exists, otherwise false
   */
  hasJob(queueName: string, jobId: string): Promise<boolean>;

  /**
   * Updates an existing job in the specified queue.
   *
   * @param {string} queueName - The name of the queue where the job exists.
   * @param {string} jobId - The unique identifier of the job to be updated.
   * @param {Partial<JobData>} updatedJobData - The updated job data (partial update).
   *
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the job was updated successfully, or `false` if the job was not found.
   *
   * @example
   * const updatedData = { retries: 5, data: { macAddress: '00:11:22:33:44:55' } };
   * const success = await queueService.updateJob('eta-lider-task', 'job-id-123', updatedData);
   * console.log(success); // Outputs true if the job was updated, otherwise false
   */
  updateJob(
    queueName: string,
    jobId: string,
    updatedJobData: Partial<Job>,
  ): Promise<boolean>;

  getQueue(queueName: string): Job[];
}
