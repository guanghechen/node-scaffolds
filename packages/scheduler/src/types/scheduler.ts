import type { IResumable, IResumableMonitor } from './resumable'

export interface ISchedulerMonitor extends IResumableMonitor {}

export interface IScheduler extends IResumable {
  /**
   * Resolved when all tasks from the pipeline are settled.
   */
  waitDrain(): Promise<void>
}
