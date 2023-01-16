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
