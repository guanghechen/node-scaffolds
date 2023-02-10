import { createHash } from 'node:crypto'

/**
 * Calc Message Authentication Code.
 *
 * @param pieces
 */
export function calcMac(...pieces: Array<Readonly<Buffer>>): Buffer {
  const sha256 = createHash('sha256')
  for (const piece of pieces) sha256.update(piece)
  const mac: Buffer = sha256.digest()
  return mac
}

/**
 * Calc Message Authentication Code from literal string.
 *
 * @param text
 * @param textEncoding
 * @returns
 */
export function calcMacFromString(text: string, textEncoding: BufferEncoding): Buffer {
  const sha256 = createHash('sha256')
  sha256.update(text, textEncoding)
  const mac: Buffer = sha256.digest()
  return mac
}

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
