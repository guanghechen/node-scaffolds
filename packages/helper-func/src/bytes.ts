const bytesUnit = {
  K: 1024,
  M: 1024 ** 2,
  G: 1024 ** 3,
  T: 1024 ** 4,
  P: 1024 ** 5,
}
const unitKeys: string = Object.keys(bytesUnit).join('')
const bytesRegex = new RegExp(`^\\s*(\\d+(?:\\.\\d+)?)([${unitKeys}]B?)?\\s*$`)

/**
 * Parse texts like 1M, 1Mb, 1G to the number of bytes.
 *
 * @param text
 */
export function parseBytesString(text: string): number {
  const match = bytesRegex.exec(text)
  if (match) {
    const [, num, unit] = match
    const bytes: number = Number(num) * (bytesUnit[unit as keyof typeof bytesUnit] ?? 1)
    return Math.max(0, Math.floor(bytes))
  }
  return 0
}
