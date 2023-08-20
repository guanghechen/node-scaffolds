import { PipelineStatus } from './constant/pipeline'
import type { IBatchMonitor } from './types/monitor'
import type { ICommonPipeline, IPipelineMonitor } from './types/pipeline'
import { batchMonitor } from './util/batchMonitor'

export abstract class BaseCommonPipeline implements ICommonPipeline {
  protected readonly _batchMonitor: IBatchMonitor<IPipelineMonitor>
  protected _status: PipelineStatus

  constructor() {
    this._status = PipelineStatus.ALIVE
    this._batchMonitor = batchMonitor<IPipelineMonitor>()
  }

  public get status(): PipelineStatus {
    return this._status
  }

  public abstract readonly size: number

  public monitor(monitor: IPipelineMonitor): () => void {
    if (this.status === PipelineStatus.CLOSED) return () => {}
    return this._batchMonitor.subscribe(monitor)
  }

  public close(): Promise<void> | void {
    if (this._status === PipelineStatus.CLOSED) return
    this._status = PipelineStatus.CLOSED
    this._batchMonitor.onClosed()
  }
}
