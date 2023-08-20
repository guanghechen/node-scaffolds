const bit = 1

export enum ResumableStatus {
  PENDING = bit << 0, // Service not start.
  RUNNING = bit << 1, // Service is running.
  SUSPENDED = bit << 2, // Service is paused.
  CANCELLED = bit << 3, // Service is cancelled.
  FAILED = bit << 4, // Service is failed.
  COMPLETED = bit << 5, // Service is succeed.
  ATTEMPT_SUSPENDING = bit << 6, // Attempting to suspend the task.
  ATTEMPT_RESUMING = bit << 7, // Attempting to resume the task.
  ATTEMPT_CANCELING = bit << 8, // Attempting to cancel the task.
}

const alive =
  ResumableStatus.PENDING |
  ResumableStatus.RUNNING |
  ResumableStatus.SUSPENDED |
  ResumableStatus.ATTEMPT_SUSPENDING |
  ResumableStatus.ATTEMPT_RESUMING
export function isAlive(status: ResumableStatus): boolean {
  return (status & alive) > 0
}

const waiting =
  ResumableStatus.PENDING | ResumableStatus.SUSPENDED | ResumableStatus.ATTEMPT_SUSPENDING
export function isWaiting(status: ResumableStatus): boolean {
  return (status & waiting) > 0
}

const terminated = ResumableStatus.CANCELLED | ResumableStatus.FAILED | ResumableStatus.COMPLETED
export function isTerminated(status: ResumableStatus): boolean {
  return (status & terminated) > 0
}

const completed = ResumableStatus.FAILED | ResumableStatus.COMPLETED
export function isCompleted(status: ResumableStatus): boolean {
  return (status & completed) > 0
}
