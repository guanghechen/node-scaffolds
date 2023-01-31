export const list2map = <K, T>(
  elements: Iterable<T>,
  getKey: (element: T, index: number) => K,
): Map<K, T> => {
  const map: Map<K, T> = new Map()
  let i = 0
  for (const value of elements) {
    const key = getKey(value, i)
    map.set(key, value)
    i += 1
  }
  return map
}
