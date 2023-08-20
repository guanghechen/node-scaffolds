import type { PipelineStatus } from './constant/pipeline'
import { isPipelineTerminated } from './constant/pipeline'
import { ResumableStatus, isAlive, isTerminated } from './constant/resumable'
import { Resumable } from './Resumable'
import { ScheduledTask } from './ScheduledTask'
import type { IPromiseDispatch, IReporter } from './types/common'
import type { IConsumerPipeline, IPipelineMonitor } from './types/pipeline'
import type { IScheduler, ISchedulerMonitor } from './types/scheduler'
import type { IScheduledTask, ITask, ITaskMonitor } from './types/task'

export interface ISequentialSchedulerProps<T extends ITask> {
  pipeline: IConsumerPipeline<T>
  reporter?: IReporter
  monitor?: ISchedulerMonitor
}

export class SequentialScheduler<T extends ITask>
  extends Resumable<ISchedulerMonitor>
  implements IScheduler
{
  protected readonly _pipeline: IConsumerPipeline<T>
  protected readonly _taskMonitor: ITaskMonitor
  protected readonly _pipelineMonitor: IPipelineMonitor
  protected readonly _reporter: IReporter | undefined
  protected _task: IScheduledTask | undefined
  protected _promise: IPromiseDispatch | undefined
  protected _waitDrainPromises: IPromiseDispatch[]

  constructor(props: ISequentialSchedulerProps<T>) {
    super(props)
    this._reporter = props.reporter
    this._task = undefined
    this._waitDrainPromises = []

    const onFinished = (): void => {
      this._task = undefined
      this._schedule()
    }
    this._taskMonitor = {
      onStarted: () => {},
      onSuspended: () => {},
      onResumed: () => {},
      onCanceled: onFinished,
      onFailed: onFinished,
      onCompleted: onFinished,
    }
    this._pipelineMonitor = {
      onPushed: () => this._schedule(),
      onPulled: () => {},
      onClosed: () => this._schedule(),
    }

    this._pipeline = props.pipeline
    this._pipeline.monitor(this._pipelineMonitor)
  }

  public async start(): Promise<void> {
    if (this._status !== ResumableStatus.PENDING) return
    this._status = ResumableStatus.RUNNING

    let completed = false
    return new Promise<void>((resolve, reject) => {
      this._promise = {
        resolve: () => {
          if (!completed) resolve()
          completed = true
        },
        reject: (error: unknown) => {
          if (!completed) reject(error)
          completed = true
        },
      }
      this._schedule()
    })
  }

  public async pause(): Promise<void> {
    if (this._status !== ResumableStatus.RUNNING) return
    this._status = ResumableStatus.ATTEMPT_SUSPENDING

    try {
      await this._task?.pause()
      this._transitStatus(ResumableStatus.SUSPENDED)
    } catch (error) {
      this._transitStatus(ResumableStatus.FAILED, error)
    }
  }

  public async resume(): Promise<void> {
    if (this._status !== ResumableStatus.SUSPENDED) return
    this._status = ResumableStatus.ATTEMPT_RESUMING

    try {
      await this._task?.resume()
      this._transitStatus(ResumableStatus.RUNNING)
    } catch (error) {
      this._transitStatus(ResumableStatus.FAILED, error)
    }
  }

  public async cancel(): Promise<void> {
    if (!isAlive(this._status)) return
    this._status = ResumableStatus.ATTEMPT_CANCELING

    try {
      await this._task?.cancel()
      this._transitStatus(ResumableStatus.CANCELLED)
    } catch (error) {
      this._transitStatus(ResumableStatus.FAILED, error)
    }
  }

  public waitDrain(): Promise<void> {
    if (isTerminated(this._status)) return Promise.resolve()

    let completed = false
    return new Promise<void>((resolve, reject) => {
      this._waitDrainPromises.push({
        resolve: () => {
          if (!completed) resolve()
          completed = true
        },
        reject: (error: unknown) => {
          if (!completed) reject(error)
          completed = true
        },
      })
    })
  }

  protected _schedule(): void {
    if (this._status !== ResumableStatus.RUNNING) return
    if (this._task === undefined || isTerminated(this._task.status)) {
      if (this._task && this._task.error) {
        this._reporter?.reportError(this._task.error)
      }

      this._task = undefined
      const nextTask = this._pipeline.pull()
      if (nextTask === undefined) {
        const pipelineStatus: PipelineStatus = this._pipeline.status
        if (this._waitDrainPromises.length > 0) {
          const waitDrainPromises = this._waitDrainPromises
          this._waitDrainPromises = []
          for (const promise of waitDrainPromises) promise.resolve()
        }
        if (isPipelineTerminated(pipelineStatus)) this._transitStatus(ResumableStatus.COMPLETED)
        return
      }
      this._task = new ScheduledTask({ task: nextTask, monitor: this._taskMonitor })
    }

    switch (this._task.status) {
      case ResumableStatus.PENDING:
        void this._task.start()
        break
      case ResumableStatus.SUSPENDED:
      case ResumableStatus.ATTEMPT_SUSPENDING:
        void this._task.resume()
        break
      case ResumableStatus.RUNNING:
      case ResumableStatus.ATTEMPT_RESUMING:
        break
      default:
        this._task = undefined
        this._schedule()
    }
  }

  protected override _resolve(): void {
    this._promise?.resolve()
  }

  protected override _reject(error: unknown): void {
    this._promise?.reject(error)
  }

  protected override _transitStatus(nextStatus: ResumableStatus, error?: unknown): void {
    const status = this._status
    super._transitStatus(nextStatus, error)
    if (status !== this._status) {
      switch (this._status) {
        case ResumableStatus.RUNNING:
          this._schedule()
          break
      }
    }
  }
}
