import { calcMacFromString } from '@guanghechen/helper-cipher'
import { ensureCriticalFilepathExistsSync } from '@guanghechen/helper-fs'
import { createHash } from 'node:crypto'
import fs from 'node:fs'

/**
 * Calc Message Authentication Code from fle.
 *
 * @param filepath
 * @returns
 */
export async function calcMacFromFile(filepath: string): Promise<Buffer | never> {
  ensureCriticalFilepathExistsSync(filepath)

  const sha256 = createHash('sha256')
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
