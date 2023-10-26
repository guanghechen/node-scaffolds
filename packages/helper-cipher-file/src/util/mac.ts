import { bytes2text } from '@guanghechen/byte'
import type { IHashAlgorithm } from '@guanghechen/mac'
import { calcMac, calcMacFromFile } from '@guanghechen/mac'

export function calcFingerprintFromMac(mac: Uint8Array): string {
  return bytes2text(mac, 'hex')
}

// Calc fingerprint from literal string.
export function calcFingerprintFromString(
  text: string,
  textEncoding: BufferEncoding,
  algorithm: IHashAlgorithm,
): string {
  const buffer: Buffer = Buffer.from(text, textEncoding)
  const mac: Uint8Array = calcMac([buffer], algorithm)
  return calcFingerprintFromMac(mac)
}

// Calc fingerprint from file.
export async function calcFingerprintFromFile(
  filepath: string,
  algorithm: IHashAlgorithm,
): Promise<string> {
  const mac = await calcMacFromFile(filepath, algorithm)
  return calcFingerprintFromMac(mac)
}
