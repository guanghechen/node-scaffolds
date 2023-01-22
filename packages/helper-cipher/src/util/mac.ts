import { ensureCriticalFilepathExistsSync } from '@guanghechen/helper-fs'
import { createHash } from 'node:crypto'
import fs from 'node:fs'

/**
 * Calc Message Authentication Code.
 *
 * @param pieces
 */
export function calcMac(...pieces: Array<Readonly<Buffer>>): Buffer {
  // TODO: use sha256 instead.
  const sha256 = createHash('sha1')
  for (const piece of pieces) sha256.update(piece as Buffer)
  const mac: Buffer = sha256.digest()
  return mac
}

/**
 * Calc Message Authentication code from literal string.
 *
 * @param text
 * @param textEncoding
 * @returns
 */
export function calcMacFromString(text: string, textEncoding: BufferEncoding): Buffer {
  // TODO: use sha256 instead.
  const sha256 = createHash('sha1')
  sha256.update(text, textEncoding)
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

  // TODO: use sha256 instead.
  const sha256 = createHash('sha1')
  const stream = fs.createReadStream(filepath)
  for await (const chunk of stream) sha256.update(chunk)
  const mac: Buffer = sha256.digest()
  return mac
}

export const calcFingerprintFromMac = (mac: Buffer): string => mac.toString('hex')

/**
 * Calc fingerprint from literal string.
 *
 * @param text
 * @param textEncoding
 * @returns
 */
export function calcFingerprintFromString(text: string, textEncoding: BufferEncoding): string {
  const mac: Buffer = calcMacFromString(text, textEncoding)
  return calcFingerprintFromMac(mac)
}

/**
 * Calc fingerprint from file.
 *
 * @param mac
 * @returns
 */
export async function calcFingerprintFromFile(filepath: string): Promise<string> {
  const mac = await calcMacFromFile(filepath)
  return calcFingerprintFromMac(mac)
}
