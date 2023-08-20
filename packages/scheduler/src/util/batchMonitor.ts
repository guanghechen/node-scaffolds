import type { IBatchMonitor } from '../types/monitor'

const listenerNameRegex = /^on[A-Z]/

export function batchMonitor<T>(): IBatchMonitor<T> {
  // eslint-disable-next-line new-cap
  let monitors: T[] = []

  const appendMonitor = (monitor: T): (() => void) => {
    if (!monitors.includes(monitor)) monitors.push(monitor)
    return () => {
      monitors = monitors.filter(x => x !== monitor)
    }
  }

  return new Proxy<IBatchMonitor<T>>({} as IBatchMonitor<T>, {
    has: function (_target, key) {
      if (key === 'subscribe') return true
      return typeof key === 'string' && listenerNameRegex.test(key)
    },
    get: function (_target, key) {
      if (key === 'subscribe') return appendMonitor
      return (...args: unknown[]) => {
        for (const monitor of monitors) {
          ;(monitor[key as keyof T] as (...args: unknown[]) => void)(...args)
        }
      }
    },
  })
}
