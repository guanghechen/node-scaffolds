import { useEffect, useRef } from 'react'

type Callback = () => void

/**
 * Execute callback interval in react function components.
 * @param callback
 * @param delay
 */
export function useInterval(callback: Callback, delay: number): void {
  const callbackRef = useRef<Callback>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [])

  useEffect(() => {
    const tick: Callback = () => void callbackRef.current()
    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay])
}
