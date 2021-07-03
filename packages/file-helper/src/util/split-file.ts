import invariant from '@guanghechen/invariant'
import fs from 'fs-extra'
import type { FilePartItem } from '../types'

/**
 * Generate file part items by part size.
 *
 * @param filepath
 * @param _partSize
 * @returns
 */
export function calcFilePartItemsBySize(
  filepath: string,
  _partSize: number,
): FilePartItem[] {
  invariant(_partSize >= 1, 'Part size should be a positive integer!')

  const stat = fs.statSync(filepath)
  invariant(stat.isFile(), `'${filepath}' is not a file!`)

  const totalSize = stat.size
  if (totalSize <= 0) return []

  const partSize = Math.round(_partSize)
  const partTotal = Math.ceil(totalSize / partSize)
  invariant(partTotal > 0, 'Part size is too small!')

  const parts: FilePartItem[] = []
  for (let i = 0; i < partTotal; ++i) {
    parts.push({
      sid: i + 1,
      start: i * partSize,
      end: (i + 1) * partSize,
    })
  }

  // Resize the size of the last part.
  parts[parts.length - 1].end = totalSize
  return parts
}

/**
 * Generate file part items by total of parts.
 *
 * @param filepath
 * @param _partTotal
 * @returns
 */
export function calcFilePartItemsByCount(
  filepath: string,
  _partTotal: number,
): FilePartItem[] {
  invariant(_partTotal >= 1, 'Total of part should be a positive integer!')

  const stat = fs.statSync(filepath)
  invariant(stat.isFile(), `'${filepath}' is not a file!`)

  const totalSize = stat.size
  if (totalSize <= 0) return []

  const partTotal = Math.round(_partTotal)
  const partSize = Math.ceil(totalSize / partTotal)
  const parts: FilePartItem[] = []
  for (let i = 0; i < partTotal; ++i) {
    parts.push({
      sid: i + 1,
      start: i * partSize,
      end: (i + 1) * partSize,
    })
  }

  // Resize the size of the last part.
  parts[parts.length - 1].end = totalSize
  return parts
}
