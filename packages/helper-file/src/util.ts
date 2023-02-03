import invariant from '@guanghechen/invariant'
import type { IFilePartItem } from './types'

/**
 * Generate file part items by part size.
 *
 * @param fileSize
 * @param _partSize
 * @returns
 */
export function calcFilePartItemsBySize(fileSize: number, _partSize: number): IFilePartItem[] {
  invariant(_partSize >= 1, 'Part size should be a positive integer!')

  if (fileSize <= 0) return [{ sid: 1, start: 0, end: 0 }]
  if (fileSize <= _partSize) return [{ sid: 1, start: 0, end: fileSize }]

  const partSize = Math.round(_partSize)
  const partTotal = Math.ceil(fileSize / partSize)
  invariant(partTotal > 0, 'Part size is too small!')

  const parts: IFilePartItem[] = []
  for (let i = 0; i < partTotal; ++i) {
    parts.push({
      sid: i + 1,
      start: i * partSize,
      end: (i + 1) * partSize,
    })
  }

  // Resize the size of the last part.
  parts[parts.length - 1].end = fileSize
  return parts
}

/**
 * Generate file part items by total of parts.
 *
 * @param filepath
 * @param _partTotal
 * @returns
 */
export function calcFilePartItemsByCount(fileSize: number, _partTotal: number): IFilePartItem[] {
  invariant(_partTotal >= 1, 'Total of part should be a positive integer!')

  if (fileSize <= 0) return [{ sid: 1, start: 0, end: 0 }]

  const partTotal = Math.round(_partTotal)
  const partSize = Math.ceil(fileSize / partTotal)
  const parts: IFilePartItem[] = []
  for (let i = 0; i < partTotal; ++i) {
    parts.push({
      sid: i + 1,
      start: i * partSize,
      end: (i + 1) * partSize,
    })
  }

  // Resize the size of the last part.
  parts[parts.length - 1].end = fileSize
  return parts
}

/**
 * Calculate names of parts of sourcefile respectively.
 *
 * @param parts
 * @param partCodePrefix
 * @returns
 */
export function calcFilePartNames(
  parts: ReadonlyArray<Pick<IFilePartItem, 'sid'>>,
  partCodePrefix: string,
): string[] {
  if (parts.length === 0) return []
  if (parts.length === 1) return ['']

  // Part name (file name of part)
  // get the max number of digits to generate for part number
  // ex. if original file is split into 4 files, then it will be 1
  // ex. if original file is split into 14 files, then it will be 2
  // etc.
  const maxPaddingCount = String(parts.length).length

  const partNames = parts.map(part => {
    // construct part number for current file part, e.g. (assume the partCodePrefix is ".ghc-part")
    //
    //    .ghc-part01
    //    ...
    //    .ghc-part14
    const partCode = String(part.sid).padStart(maxPaddingCount, '0')
    return partCodePrefix + partCode
  })

  return partNames
}
