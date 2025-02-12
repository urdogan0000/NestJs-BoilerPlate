import { JobData } from '../types/job.data.type';
import * as crypto from 'crypto';

/**
 * Generates a unique job ID for a given queue and job data.
 *
 * This function creates a SHA-256 hash from the provided `jobData` and uses it, along with the queue name, process,
 * target request domain, and the MAC address from the job data, to generate a unique job ID.
 * The resulting job ID is used for tracking and identifying jobs in a queue system.
 *
 * @param {string} queueName - The name of the queue. Used as part of the job ID for identifying which queue the job belongs to.
 * @param {JobData} jobData - The data associated with the job. It must contain `process`, `targetRequestDomain`, and `macAddress`.
 *
 * @returns {string} - A unique job ID in the format of `queueName-process-targetRequestDomain-macAddress-hash`.
 * The hash is the SHA-256 digest of the job data.
 *
 * @example
 * const jobData = { process: 'UPDATE', targetRequestDomain: 'LIDER', data: { macAddress: '00:11:22:33:44:55' }};
 * const jobId = generateJobId('eta-lider-task', jobData);
 * console.log(jobId); // Outputs a unique job ID
 */
export function generateJobId(queueName: string, jobData: JobData): string {
  const jobDataHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(jobData))
    .digest('hex');

  return `${queueName}-${jobData.process}-${jobData.targetRequestDomain}-${jobData.data.macAddress}-${jobDataHash}`;
}
