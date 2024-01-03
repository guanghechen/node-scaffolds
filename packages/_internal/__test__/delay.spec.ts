import { jest } from '@jest/globals'
import { delay } from '../src'

jest.useFakeTimers() // Mock the timers to control setTimeout

describe('delay', () => {
  it('should resolve after a given duration', async () => {
    let done = false
    async function run(duration: number): Promise<void> {
      await delay(duration)
      done = true
    }

    const delayDuration = 1000
    void run(delayDuration)

    await Promise.resolve()
    expect(done).toBe(false)

    jest.advanceTimersByTime(delayDuration) // Advance timers by the specified duration

    await Promise.resolve()
    expect(done).toBe(true)
  })

  it('should not resolve before the given duration', async () => {
    let done = false
    async function run(duration: number): Promise<void> {
      await delay(duration)
      done = true
    }

    const delayDuration = 1000
    void run(delayDuration)

    await Promise.resolve()
    expect(done).toBe(false)

    jest.advanceTimersByTime(delayDuration - 1) // Advance timers by a bit less than the duration

    await Promise.resolve()
    expect(done).toBe(false)

    jest.advanceTimersByTime(1) // To make sure the delayPromise resolved.

    await Promise.resolve()
    expect(done).toBe(true)
  })

  it('should work with 0 duration', async () => {
    let done = false
    async function run(duration: number): Promise<void> {
      await delay(duration)
      done = true
    }

    void run(0)

    await Promise.resolve()
    expect(done).toBe(false)

    jest.advanceTimersByTime(0) // No need to advance timers, already waited 0 ms

    await Promise.resolve()
    expect(done).toBe(true)
  })
})
