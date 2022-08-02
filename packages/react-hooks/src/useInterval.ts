import { useEffect, useRef } from 'react'

type Callback = () => void

/**
 * Execute callback interval in react function components.
 * @param callback
 * @param duration
 */
export function useInterval(callback: Callback, duration: number): void {
  const callbackRef = useRef<Callback>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const tick: Callback = () => {
      if (callbackRef.current === undefined) return
      callbackRef.current()
    }
    const id = setInterval(tick, duration)
    return () => clearInterval(id)
  }, [duration])
}
