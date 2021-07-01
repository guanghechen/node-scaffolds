import crypto from 'crypto'

/**
 * Fill buffer with a random number
 */
export function destroyBuffer(buffer: Buffer | null): void {
  if (buffer == null) return
  buffer.fill(0)
  buffer.fill(1)
  buffer.fill(Math.random() * 127)
}

/**
 * Destroy buffers
 */
export function destroyBuffers(buffers: Array<Buffer | null> | null): void {
  if (buffers == null) return
  for (const buffer of buffers) {
    destroyBuffer(buffer)
  }
}

/**
 * Create random initial vector
 */
export function createRandomIv(size = 32): Buffer {
  return crypto.randomBytes(size)
}

/**
 * Create random key of aes
 */
export function createRandomKey(size = 32): Buffer {
  return crypto.randomBytes(size)
}

/**
 * calc Message Authentication Code
 * @param pieces
 */
export function calcMac(...pieces: Array<Readonly<Buffer>>): Buffer {
  const sha1 = crypto.createHash('sha1')
  for (const piece of pieces) {
    sha1.update(piece as Buffer)
  }
  const mac: Buffer = sha1.digest()
  return mac
}
