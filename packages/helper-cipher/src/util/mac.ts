import { ensureCriticalFilepathExistsSync } from '@guanghechen/helper-fs'
import { destroyBuffers } from '@guanghechen/helper-stream'
import { createHash } from 'node:crypto'
import fs from 'node:fs'

/**
 * Calc Message Authentication Code
 * @param pieces
 */
export function calcMac(...pieces: Array<Readonly<Buffer>>): Buffer {
  // TODO: use sha256 instead.
  const sha256 = createHash('sha1')
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

  let result: Buffer | never
  const chunks: Buffer[] = []

  try {
    const stream = fs.createReadStream(filepath)
    for await (const chunk of stream) chunks.push(chunk)
    result = calcMac(...chunks)
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
