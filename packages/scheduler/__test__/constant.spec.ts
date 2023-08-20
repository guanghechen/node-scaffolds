import { ResumableStatus, isAlive, isCompleted, isTerminated, isWaiting } from '../src'

describe('PipelineStatus', () => {})

describe('ResumableStatus', () => {
  test('isAlive', () => {
    expect(isAlive(ResumableStatus.PENDING)).toEqual(true)
    expect(isAlive(ResumableStatus.RUNNING)).toEqual(true)
    expect(isAlive(ResumableStatus.SUSPENDED)).toEqual(true)
    expect(isAlive(ResumableStatus.CANCELLED)).toEqual(false)
    expect(isAlive(ResumableStatus.FAILED)).toEqual(false)
    expect(isAlive(ResumableStatus.COMPLETED)).toEqual(false)
    expect(isAlive(ResumableStatus.ATTEMPT_SUSPENDING)).toEqual(true)
    expect(isAlive(ResumableStatus.ATTEMPT_RESUMING)).toEqual(true)
    expect(isAlive(ResumableStatus.ATTEMPT_CANCELING)).toEqual(false)
  })

  test('isWaiting', () => {
    expect(isWaiting(ResumableStatus.PENDING)).toEqual(true)
    expect(isWaiting(ResumableStatus.RUNNING)).toEqual(false)
    expect(isWaiting(ResumableStatus.SUSPENDED)).toEqual(true)
    expect(isWaiting(ResumableStatus.CANCELLED)).toEqual(false)
    expect(isWaiting(ResumableStatus.FAILED)).toEqual(false)
    expect(isWaiting(ResumableStatus.COMPLETED)).toEqual(false)
    expect(isWaiting(ResumableStatus.ATTEMPT_SUSPENDING)).toEqual(true)
    expect(isWaiting(ResumableStatus.ATTEMPT_RESUMING)).toEqual(false)
    expect(isWaiting(ResumableStatus.ATTEMPT_CANCELING)).toEqual(false)
  })

  test('isCompleted', () => {
    expect(isCompleted(ResumableStatus.PENDING)).toEqual(false)
    expect(isCompleted(ResumableStatus.RUNNING)).toEqual(false)
    expect(isCompleted(ResumableStatus.SUSPENDED)).toEqual(false)
    expect(isCompleted(ResumableStatus.CANCELLED)).toEqual(false)
    expect(isCompleted(ResumableStatus.FAILED)).toEqual(true)
    expect(isCompleted(ResumableStatus.COMPLETED)).toEqual(true)
    expect(isCompleted(ResumableStatus.ATTEMPT_SUSPENDING)).toEqual(false)
    expect(isCompleted(ResumableStatus.ATTEMPT_RESUMING)).toEqual(false)
    expect(isCompleted(ResumableStatus.ATTEMPT_CANCELING)).toEqual(false)
  })

  test('isTerminated', () => {
    expect(isTerminated(ResumableStatus.PENDING)).toEqual(false)
    expect(isTerminated(ResumableStatus.RUNNING)).toEqual(false)
    expect(isTerminated(ResumableStatus.SUSPENDED)).toEqual(false)
    expect(isTerminated(ResumableStatus.CANCELLED)).toEqual(true)
    expect(isTerminated(ResumableStatus.FAILED)).toEqual(true)
    expect(isTerminated(ResumableStatus.COMPLETED)).toEqual(true)
    expect(isTerminated(ResumableStatus.ATTEMPT_SUSPENDING)).toEqual(false)
    expect(isTerminated(ResumableStatus.ATTEMPT_RESUMING)).toEqual(false)
    expect(isTerminated(ResumableStatus.ATTEMPT_CANCELING)).toEqual(false)
  })
})
