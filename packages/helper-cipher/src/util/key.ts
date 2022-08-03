import { ensureCriticalFilepathExistsSync } from '@guanghechen/helper-file'
import crypto from 'crypto'
import fs from 'fs-extra'
import { destroyBuffers } from './buffer'

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

/**
 * Calc Message Authentication Code from fle.
 *
 * @param filepath
 * @returns
 */
export async function calcMacFromFile(filepath: string): Promise<Buffer | never> {
  ensureCriticalFilepathExistsSync(filepath)

  const sha1 = crypto.createHash('sha1')
  const chunks: Buffer[] = []
  const stream = fs.createReadStream(filepath)
  let result: Buffer | never

  try {
    await new Promise((resolve, reject) => {
      stream
        .on('data', chunk => {
          chunks.push(chunk as Buffer)
          sha1.update(chunk)
        })
        .on('error', reject)
        .on('end', resolve)
    })

    result = sha1.digest()
  } finally {
    destroyBuffers(chunks)
  }

  return result
}

/**
 * Calculate fingerprint from buffer contents.
 *
 * @param contents
 * @returns
 */
export function calcFingerprint(contents: Buffer): string {
  const fingerprint = contents.toString('hex')
  return fingerprint
}
