import { JobData } from './job.data.type';

/**
 * Interface representing a job in the queue system.
 *
 * The `Job` interface defines the structure of a job, including its unique identifier, associated data,
 * retry count, delay, and the timestamp when the job was created.
 */
export interface Job {
  /**
   * A unique identifier for the job.
   * This ID is typically generated based on the job's data and the queue it belongs to.
   *
   * @type {string}
   */
  id: string;

  /**
   * The data associated with the job. This is an object that contains the specific information
   * required to process the job, structured according to the `JobData` interface.
   *
   * @type {JobData}
   */
  data: JobData;

  /**
   * The number of retries allowed for the job if it fails. This is a numeric value indicating
   * how many times the job can be retried before it's considered permanently failed.
   *
   * @type {number}
   */
  retries: number;

  /**
   * The delay (in milliseconds) before the job is executed. This can be used to schedule a job to run
   * after a certain period of time.
   *
   * @type {number}
   */
  delay: number;

  /**
   * The timestamp when the job was created. This is typically a Unix timestamp (in milliseconds)
   * representing the moment the job was added to the queue.
   *
   * @type {number}
   */
  timestamp: number;
}
