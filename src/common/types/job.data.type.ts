import {
  PlatformType,
  SchoolQueryDto,
} from 'src/etaRegister/dtos/school.query.dto';
import { UpdateEtaSchoolDto } from 'src/etaRegister/dtos/update.eta.school.dto';
import { UpdateLiderSchoolDto } from 'src/etaRegister/dtos/update.lider.school.dto';

/**
 * Interface representing the data for a job.
 *
 * The `JobData` interface defines the structure for the data associated with a job,
 * including the type of data, the target request domain, the process name, and optionally
 * a unique key for the job.
 */
export interface JobData {
  /**
   * The data associated with the job. This can be one of the following types:
   * - `UpdateEtaSchoolDto`: Represents the data for updating a school in the ETA system.
   * - `UpdateLiderSchoolDto`: Represents the data for updating a school in the Lider system.
   * - `SchoolQueryDto`: Represents the query data for retrieving school information.
   *
   * @type {UpdateEtaSchoolDto | UpdateLiderSchoolDto | SchoolQueryDto}
   */
  data: UpdateEtaSchoolDto | UpdateLiderSchoolDto | SchoolQueryDto;

  /**
   * The target request domain for the job. This specifies which platform the job is targeting.
   *
   * @type {PlatformType}
   */
  targetRequestDomain: PlatformType;

  /**
   * The process name associated with the job. This is a string that describes the job's purpose
   * or the specific operation being performed.
   *
   * @type {string}
   */
  process: string;

  /**
   * An optional key that can be used to uniquely identify the job. If provided, this key can be
   * used for job tracking or ensuring that duplicate jobs are not added.
   *
   * @type {string}
   * @optional
   */
  key?: string;
}
