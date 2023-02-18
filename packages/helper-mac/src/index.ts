import { createHash } from 'node:crypto'
import fs from 'node:fs'

export type IHashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'

/**
 * Calc Message Authentication Code.
 *
 * @param pieces
 */
export function calcMac(
  chunks: ReadonlyArray<Readonly<Buffer>>,
  algorithm: IHashAlgorithm,
): Buffer {
  const sha256 = createHash(algorithm)
  for (const chunk of chunks) sha256.update(chunk)
  const mac: Buffer = sha256.digest()
  return mac
}

/**
 * Calc Message Authentication Code from fle.
 *
 * @param filepath
 * @returns
 */
export async function calcMacFromFile(
  filepath: string,
  algorithm: IHashAlgorithm,
): Promise<Buffer | never> {
  if (!fs.existsSync(filepath)) {
    throw new Error(`[calcMacFromFile] filepath is not found. (${filepath})`)
  }

  if (!fs.statSync(filepath).isFile()) {
    throw new Error(`[calcMacFromFile] filepath is not a file. (${filepath})`)
  }

  const sha256 = createHash(algorithm)
  const stream = fs.createReadStream(filepath)
  for await (const chunk of stream) sha256.update(chunk)
  const mac: Buffer = sha256.digest()
  return mac
}
