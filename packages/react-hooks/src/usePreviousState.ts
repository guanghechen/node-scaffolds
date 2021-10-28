import { useEffect, useRef } from 'react'

/**
 * Use previous state.
 * @param value
 * @returns
 */
export function usePreviousState<T = any>(value: T): T {
  const ref = useRef<T>(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
