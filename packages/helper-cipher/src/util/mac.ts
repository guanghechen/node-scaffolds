import { ensureCriticalFilepathExistsSync } from '@guanghechen/helper-path'
import { destroyBuffers } from '@guanghechen/helper-stream'
import crypto from 'crypto'
import fs from 'node:fs'

/**
 * Calc Message Authentication Code
 * @param pieces
 */
export function calcMac(...pieces: Array<Readonly<Buffer>>): Buffer {
  const sha256 = crypto.createHash('sha256')
  for (const piece of pieces) {
    sha256.update(piece as Buffer)
  }
  const mac: Buffer = sha256.digest()
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

  const sha256 = crypto.createHash('sha256')
  const stream = fs.createReadStream(filepath)
  const chunks: Buffer[] = []
  let result: Buffer | never

  try {
    for await (const chunk of stream) {
      sha256.update(chunk)
      chunks.push(chunk)
    }
    result = sha256.digest()
  } finally {
    destroyBuffers(chunks)
  }

  return result
}

/**
 * Calc fingerprint from buffer contents.
 *
 * @param mac
 * @returns
 */
export function calcFingerprint(mac: Buffer): string {
  const fingerprint = mac.toString('hex')
  return fingerprint
}
