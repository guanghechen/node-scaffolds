const intervalRegex = /^(\d+)(?:-(\d+))?$/
const defaultSeparator = /[,\s]+/

/**
 * - ''             => []
 * - '1'            => [1]
 * - '1-3'          => [1, 2, 3]
 * - '3,1-2,2,2'    => [1, 2, 3]
 * - '3,7-5,2,2'    => [2, 3, 5, 6, 7]
 * - '2,1-3'        => [1, 2, 3]
 * - '4,1-3'        => [1, 2, 3, 4]
 * - '2-4,1-3,5-9'  => [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * - '2-4,1-3,6-9'  => [1, 2, 3, 4, 6, 7, 8, 9]
 *
 * @param text
 */
export function collectNumbers(text: string, separator = defaultSeparator): number[] {
  const intervals: Array<[number, number]> = collectIntervals(text, separator)
  const result: number[] = []
  for (const interval of intervals) {
    const [x, y] = interval
    for (let i = x; i <= y; ++i) result.push(i)
  }
  return result
}

/**
 * - ''             => []
 * - '1'            => [[1, 1]]
 * - '1-3'          => [[1, 3]]
 * - '3,1-2,2,2'    => [[1, 3]]
 * - '3,7-5,2,2'    => [[2, 3], [5, 7]]
 * - '2,1-3'        => [[1, 3]]
 * - '4,1-3'        => [[1, 4]]
 * - '2-4,1-3,5-9'  => [[1, 9]]
 * - '2-4,1-3,6-9'  => [[1, 4], [6, 9]]
 *
 * @param text
 * @returns
 */
export function collectIntervals(
  text: string,
  separator = defaultSeparator,
): Array<[number, number]> {
  const intervals: Array<[number, number]> = []
  const tokens: string[] = text.split(new RegExp(separator, 'g'))

  for (const token of tokens) {
    const match = intervalRegex.exec(token)
    if (match == null) continue

    const [, lft, rht] = match

    // A single number.
    if (rht == null) {
      const x = Number(lft)
      intervals.push([x, x])
    }

    // A number range.
    let x = Number(lft)
    let y = Number(rht)
    if (x > y) {
      const t = x
      x = y
      y = t
    }

    intervals.push([x, y])
  }

  intervals.sort((x, y) => {
    const d = x[0] - y[0]
    return d === 0 ? x[1] - y[1] : d
  })

  if (intervals.length <= 1) return intervals

  const result: Array<[number, number]> = [intervals[0]]
  for (let i = 1; i < intervals.length; ++i) {
    const interval = intervals[i]
    const top = result[result.length - 1]

    // The two intervals are intersecting or contiguous.
    if (top[1] + 1 >= interval[0]) {
      if (top[1] < interval[1]) top[1] = interval[1]
      continue
    }

    // Otherwise, they are separate.
    result.push(interval)
  }
  return result
}
