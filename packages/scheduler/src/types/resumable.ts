import type { ResumableStatus } from '../constant/resumable'

export interface IResumable {
  /**
   * Indicate the service status.
   */
  readonly status: ResumableStatus

  /**
   * Start the service.
   */
  start(): Promise<void>

  /**
   * Pause the service.
   */
  pause(): Promise<void>

  /**
   * Resume the service.
   */
  resume(): Promise<void>

  /**
   * Cancel the service.
   */
  cancel(): Promise<void>
}

export interface IResumableMonitor {
  /**
   * Called when the service start.
   */
  onStarted(): void

  /**
   * Called when the service suspended.
   */
  onSuspended(): void

  /**
   * Called when the service resumed.
   */
  onResumed(): void

  /**
   * Called when the service cancelled.
   */
  onCanceled(): void

  /**
   * Called when the service failed.
   */
  onFailed(error: unknown): void

  /**
   * Called when the service completed.
   */
  onCompleted(): void
}
