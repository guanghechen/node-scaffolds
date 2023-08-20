import { ResumableStatus, isAlive } from './constant/resumable'
import { Resumable } from './Resumable'
import type { IScheduledTask, ITask, ITaskMonitor } from './types/task'

export interface IScheduledTaskProps<T extends ITask> {
  task: T
  monitor?: ITaskMonitor | undefined
}

export class ScheduledTask<T extends ITask>
  extends Resumable<ITaskMonitor>
  implements IScheduledTask
{
  protected readonly _task: T
  protected _error: unknown | undefined

  constructor(props: IScheduledTaskProps<T>) {
    super(props)
    this._task = props.task
    this._error = undefined
  }

  public get error(): unknown | undefined {
    return this._error
  }

  public override async start(): Promise<void> {
    if (this._status !== ResumableStatus.PENDING) return
    this._transitStatus(ResumableStatus.RUNNING)

    try {
      await this._task.start()
      switch (this._task.status) {
        case ResumableStatus.CANCELLED:
          this._transitStatus(ResumableStatus.CANCELLED)
          break
        case ResumableStatus.FAILED:
          this._transitStatus(ResumableStatus.FAILED)
          break
        case ResumableStatus.COMPLETED:
          this._transitStatus(ResumableStatus.COMPLETED)
          break
        default:
          throw new Error(`Unexpected terminate status: ${this._task.status}`)
      }
    } catch (error) {
      this._transitStatus(ResumableStatus.FAILED, error)
    }
  }

  public override async pause(): Promise<void> {
    if (this._status !== ResumableStatus.RUNNING) return
    this._status = ResumableStatus.ATTEMPT_SUSPENDING

    try {
      await this._task.pause()
      this._transitStatus(ResumableStatus.SUSPENDED)
    } catch (error) {
      this._transitStatus(ResumableStatus.FAILED, error)
    }
  }

  public override async resume(): Promise<void> {
    if (this._status !== ResumableStatus.SUSPENDED) return
    this._status = ResumableStatus.ATTEMPT_RESUMING

    try {
      await this._task.resume()
      this._transitStatus(ResumableStatus.RUNNING)
    } catch (error) {
      this._transitStatus(ResumableStatus.FAILED, error)
    }
  }

  public override async cancel(): Promise<void> {
    if (!isAlive(this._status)) return
    this._status = ResumableStatus.ATTEMPT_CANCELING

    try {
      await this._task.cancel()
      this._transitStatus(ResumableStatus.CANCELLED)
    } catch (error) {
      this._transitStatus(ResumableStatus.FAILED, error)
    }
  }

  protected override _resolve(): void {
    this._error = undefined
  }

  protected override _reject(error: unknown): void {
    this._error = error
  }
}
