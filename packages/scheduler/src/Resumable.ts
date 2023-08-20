import { ResumableStatus, isCompleted, isTerminated } from './constant/resumable'
import type { IResumable, IResumableMonitor } from './types/resumable'

export interface IResumableProps<M extends IResumableMonitor> {
  monitor?: M | undefined
}

export abstract class Resumable<M extends IResumableMonitor = IResumableMonitor>
  implements IResumable
{
  protected readonly _monitor: M | undefined
  protected _status: ResumableStatus

  constructor(props: IResumableProps<M> = {}) {
    this._monitor = props.monitor
    this._status = ResumableStatus.PENDING
  }

  public get status(): ResumableStatus {
    return this._status
  }

  public abstract start(): Promise<void>

  public abstract pause(): Promise<void>

  public abstract resume(): Promise<void>

  public abstract cancel(): Promise<void>

  protected abstract _resolve(): void

  protected abstract _reject(error: unknown): void

  protected _transitStatus(nextStatus: ResumableStatus, error?: unknown): void {
    const status = this._status
    switch (nextStatus) {
      case ResumableStatus.RUNNING:
        if (status === ResumableStatus.PENDING) {
          this._status = nextStatus
          this._monitor?.onStarted()
        } else if (
          status === ResumableStatus.SUSPENDED ||
          status === ResumableStatus.ATTEMPT_RESUMING
        ) {
          this._status = nextStatus
          this._monitor?.onResumed()
        }
        break
      case ResumableStatus.SUSPENDED:
        if (status === ResumableStatus.RUNNING || status === ResumableStatus.ATTEMPT_SUSPENDING) {
          this._status = nextStatus
          this._monitor?.onSuspended()
        }
        break
      case ResumableStatus.CANCELLED:
        if (!isTerminated(status)) {
          this._status = nextStatus
          this._resolve()
          this._monitor?.onCanceled()
        }
        break
      case ResumableStatus.FAILED:
        if (!isCompleted(status)) {
          this._status = nextStatus
          this._reject(error)
          this._monitor?.onFailed(error)
        }
        break
      case ResumableStatus.COMPLETED:
        if (!isCompleted(status)) {
          this._status = nextStatus
          this._resolve()
          this._monitor?.onCompleted()
        }
        break
      default:
    }
  }
}
