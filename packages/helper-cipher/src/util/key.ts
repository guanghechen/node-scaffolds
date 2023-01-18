import { randomBytes } from 'node:crypto'

/**
 * Create random initial vector
 */
export function createRandomIv(size = 32): Buffer {
  return randomBytes(size)
}

/**
 * Create random key of aes
 */
export function createRandomKey(size = 32): Buffer {
  return randomBytes(size)
}
