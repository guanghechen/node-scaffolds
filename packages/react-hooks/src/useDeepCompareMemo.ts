import isEqual from 'fast-deep-equal/react'
import type React from 'react'
import { useMemo, useRef } from 'react'

/**
 * Deep compare version of React.useMemo
 * @param fn
 * @param deps
 */
export function useDeepCompareMemo<T>(
  fn: () => T,
  deps: React.DependencyList,
): T {
  const signal = useRef<number>(0)
  const prevDeps = useRef<React.DependencyList>(deps)

  if (!isEqual(prevDeps.current, deps)) {
    signal.current += 1
  }
  prevDeps.current = deps

  return useMemo(fn, [signal.current])
}
