export const isArray = (v: unknown[] | unknown): v is unknown[] => Array.isArray(v)

export const convertToBoolean = (v?: unknown): boolean | null => {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const t = v.toLowerCase()
    if (t === 'false') return false
    if (t === 'true') return true
  }
  return null
}

export const cover = <T>(defaultValue: T, value?: T | null): T => value ?? defaultValue

export const coverBoolean = (defaultValue: boolean, value?: unknown): boolean => {
  const resolvedValue = convertToBoolean(value)
  return cover(defaultValue, resolvedValue)
}
