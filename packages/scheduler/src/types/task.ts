import type { IResumable, IResumableMonitor } from './resumable'

export interface ITaskMonitor extends IResumableMonitor {}

export interface ITask extends IResumable {}

export interface IScheduledTask extends IResumable {
  /**
   * Task error
   */
  readonly error?: unknown
}
