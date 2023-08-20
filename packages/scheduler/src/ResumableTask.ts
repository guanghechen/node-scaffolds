import { ResumableStatus, isAlive } from './constant/resumable'
import { Resumable } from './Resumable'
import type { IPromiseDispatch } from './types/common'
import type { ITask } from './types/task'

export abstract class ResumableTask extends Resumable implements ITask {
  protected _execution: AsyncIterator<void> | undefined
  protected _step: Promise<void> | undefined
  protected _promise?: IPromiseDispatch

  public override start(): Promise<void> {
    if (this._status !== ResumableStatus.PENDING) return Promise.resolve()
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
      this._execution = this._run()
      this._execute()
    })
  }

  public override async pause(): Promise<void> {
    if (this._status !== ResumableStatus.RUNNING) return
    this._status = ResumableStatus.ATTEMPT_SUSPENDING
    await this._step
    this._transitStatus(ResumableStatus.SUSPENDED)
  }

  public override async resume(): Promise<void> {
    if (this._status !== ResumableStatus.SUSPENDED) return
    this._status = ResumableStatus.ATTEMPT_RESUMING
    await this._step
    this._transitStatus(ResumableStatus.RUNNING)
  }

  public override async cancel(): Promise<void> {
    if (!isAlive(this._status)) return
    this._status = ResumableStatus.ATTEMPT_CANCELING
    await this._step
    this._transitStatus(ResumableStatus.CANCELLED)
  }

  protected abstract _run(): AsyncIterator<void>

  protected _execute(): void {
    if (this._status !== ResumableStatus.RUNNING) return
    if (!this._execution || !!this._step) return

    this._step = this._execution
      .next()
      .then(step => {
        if (step.done) this._transitStatus(ResumableStatus.COMPLETED)
      })
      .catch(error => this._transitStatus(ResumableStatus.FAILED, error))
      .finally(() => {
        this._step = undefined
        if (this._status === ResumableStatus.RUNNING) this._execute()
      })
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
          this._execute()
          break
      }
    }
  }
}
