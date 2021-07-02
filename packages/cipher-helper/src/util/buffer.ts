import type fs from 'fs-extra'

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
  for (const buffer of buffers) {
    destroyBuffer(buffer)
  }
}

/**
 * Merge multiple read streams into Buffer serially.
 *
 * !!!The content returned by the reading stream should be Buffer instead of
 * string.
 *
 * @param stream
 * @param safeMode If true, the temporary chunks middle will be destroyed
 * @returns
 */
export async function streams2buffer(
  streams: fs.ReadStream[],
  safeMode = true,
): Promise<Buffer> {
  const chunks: Buffer[] = []
  for (const stream of streams) {
    await new Promise<void>((resolve, reject) => {
      stream
        .on('data', (chunk: Buffer) => chunks.push(chunk))
        .on('error', reject)
        .on('end', resolve)
    })
  }

  const result = Buffer.concat(chunks)
  if (safeMode) destroyBuffers(chunks)
  return result
}
