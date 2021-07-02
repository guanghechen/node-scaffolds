import crypto from 'crypto'

/**
 * Create random initial vector
 */
export function createRandomIv(size = 32): Buffer {
  return crypto.randomBytes(Math.round(size))
}

/**
 * Create random key of aes
 */
export function createRandomKey(size = 32): Buffer {
  return crypto.randomBytes(Math.round(size))
}

/**
 * Calc Message Authentication Code
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
