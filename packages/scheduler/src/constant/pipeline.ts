const bit = 1

export enum PipelineStatus {
  /**
   * The pipeline is alive, you can `pull/push` elements into it.
   */
  ALIVE = bit << 0,
  /**
   * The pipeline is closed, disallow the `push` permanently no more `push` operations can be performed, but `pull` is still allowed.
   */
  CLOSED = bit << 1,
}

export function isPipelineTerminated(status: PipelineStatus): boolean {
  return status === PipelineStatus.CLOSED
}
