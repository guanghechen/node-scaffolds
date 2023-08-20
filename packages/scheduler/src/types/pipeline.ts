import type { PipelineStatus } from '../constant/pipeline'

export interface IPipelineMonitor {
  /**
   * There is a new element be pushed into the pipeline.
   */
  onPushed(): void

  /**
   * There is a new element be pulled from the pipeline.
   */
  onPulled(): void

  /**
   * Called when the pipeline disposed.
   */
  onClosed(): void
}

export interface ICommonPipeline {
  /**
   * Indicate the pipeline status.
   */
  readonly status: PipelineStatus

  /**
   * Indicate the length of elements in the pipeline.
   */
  readonly size: number

  /**
   * Monitor the pipeline changes.
   * @param monitor
   */
  monitor(monitor: IPipelineMonitor): () => void

  /**
   * Dispose the pipeline.
   */
  close(): Promise<void> | void
}

export interface IConsumerPipeline<T> extends ICommonPipeline {
  /**
   * Retrieve an element from the pipeline.
   */
  pull(): T | undefined
}

export interface IProviderPipeline<T> extends ICommonPipeline {
  /**
   * Add a element into the pipeline.
   * @param elements
   */
  push(...elements: T[]): void
}
