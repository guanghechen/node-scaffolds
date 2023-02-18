/**
 * Fill buffer with a random number
 *
 * @param buffer
 * @returns
 */
export function destroyBuffer(buffer: Buffer | null): void {
  if (buffer == null) return
  buffer.fill(0)
  buffer.fill(1)
  buffer.fill(Math.random() * 127)
}

/**
 * Destroy buffers
 *
 * @param buffers
 * @returns
 */
export function destroyBuffers(buffers: Array<Buffer | null> | null): void {
  if (buffers == null) return
  for (const buffer of buffers) destroyBuffer(buffer)
}
