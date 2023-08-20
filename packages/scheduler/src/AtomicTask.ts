import { ResumableStatus } from './constant/resumable'
import type { ITask } from './types/task'

export abstract class AtomicTask implements ITask {
  protected _status: ResumableStatus
  protected _promise?: Promise<void>

  constructor() {
    this._status = ResumableStatus.PENDING
  }

  public get status(): ResumableStatus {
    return this._status
  }

  public start(): Promise<void> {
    if (this._status !== ResumableStatus.PENDING) return Promise.resolve()
    this._status = ResumableStatus.RUNNING

    this._promise = new Promise<void>((resolve, reject) => {
      this._run()
        .then(() => {
          this._status = ResumableStatus.COMPLETED
          resolve()
        })
        .catch(error => {
          this._status = ResumableStatus.FAILED
          reject(error)
        })
    })
    return this._promise
  }

  public async pause(): Promise<void> {
    await this._promise
  }

  public async resume(): Promise<void> {
    await this._promise
  }

  public async cancel(): Promise<void> {
    await this._promise
  }

  protected abstract _run(): Promise<void>
}
