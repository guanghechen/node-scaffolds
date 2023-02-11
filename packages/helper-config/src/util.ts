import { createHash } from 'node:crypto'

export const calcMac = (data: string): string => {
  const sha256 = createHash('sha256')
  sha256.update(data, 'utf8')
  const mac: Buffer = sha256.digest()
  return mac.toString('hex')
}
