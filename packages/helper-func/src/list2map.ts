export const list2map = <K, T>(
  elements: ReadonlyArray<T>,
  getKey: (element: T, index: number) => K,
): Map<K, T> => {
  const map: Map<K, T> = new Map()
  const N = elements.length
  for (let i = 0; i < N; ++i) {
    const value = elements[i]
    const key = getKey(value, i)
    map.set(key, value)
  }
  return map
}
