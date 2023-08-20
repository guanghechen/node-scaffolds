import { delay } from '@guanghechen/helper-func'
import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import { AtomicTask, ResumableStatus, ScheduledTask } from '../src'
import type { IScheduledTask, ITask, ITaskMonitor } from '../src'

enum Durations {
  run = 600,
  pause = 50,
  resume = 51,
  cancel = 52,
}

describe('AtomicTask', () => {
  let task: ITask
  let monitor: ITaskMonitor
  let schedulableTask: IScheduledTask
  let consoleMock: IConsoleMock

  beforeEach(() => {
    consoleMock = createConsoleMock()
    task = new AtomicTaskMock()
    monitor = new TaskMonitorMock()
    schedulableTask = new ScheduledTask<ITask>({ task, monitor })
  })

  it('should initialize with correct initial values', () => {
    expect(schedulableTask.status).toEqual(ResumableStatus.PENDING)
    expect(schedulableTask.error).toBeUndefined()
  })

  it('should run until succeed.', async () => {
    const promises: Array<Promise<void>> = []

    promises.push(schedulableTask.start())
    expect(schedulableTask.status).toEqual(ResumableStatus.RUNNING)
    expect(schedulableTask.error).toBeUndefined()

    await Promise.all(promises)

    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        "onStarted",
        "run --- 1",
        "run --- 2",
        "onCompleted",
      ]
    `)
  })

  it('should be failed', async () => {
    const error = '*** Task failed ***'
    Object.assign(task, {
      _run: async (): Promise<void> => {
        console.log('run --- 1')
        await delay(Durations.run)
        console.log('run --- 2')
        throw error
      },
    })

    const startPromise = schedulableTask.start()
    expect(schedulableTask.status).toEqual(ResumableStatus.RUNNING)
    expect(schedulableTask.error).toBeUndefined()

    await delay(30)
    const pausePromise = schedulableTask.pause()
    expect(schedulableTask.status).toEqual(ResumableStatus.ATTEMPT_SUSPENDING)
    expect(schedulableTask.error).toBeUndefined()

    await pausePromise
    expect(schedulableTask.status).toEqual(ResumableStatus.FAILED)
    expect(schedulableTask.error).toEqual(error)

    const resumePromise = schedulableTask.resume()
    expect(schedulableTask.status).toEqual(ResumableStatus.FAILED)
    expect(schedulableTask.error).toEqual(error)

    await resumePromise
    expect(schedulableTask.status).toEqual(ResumableStatus.FAILED)
    expect(schedulableTask.error).toEqual(error)

    await startPromise
    expect(schedulableTask.status).toEqual(ResumableStatus.FAILED)
    expect(schedulableTask.error).toEqual(error)

    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        "onStarted",
        "run --- 1",
        "pause --- 1",
        "run --- 2",
        "onError: *** Task failed ***",
      ]
    `)
  })

  it('atomic task cannot be really paused/resumed', async () => {
    const startPromise = schedulableTask.start()
    expect(schedulableTask.status).toEqual(ResumableStatus.RUNNING)
    expect(schedulableTask.error).toBeUndefined()

    await delay(30)
    const pausePromise = schedulableTask.pause()
    expect(schedulableTask.status).toEqual(ResumableStatus.ATTEMPT_SUSPENDING)
    expect(schedulableTask.error).toBeUndefined()

    await pausePromise
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    const resumePromise = schedulableTask.resume()
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    await resumePromise
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    await startPromise
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        "onStarted",
        "run --- 1",
        "pause --- 1",
        "run --- 2",
        "onCompleted",
        "pause --- 2",
      ]
    `)
  })

  it('atomic task cannot be really cancelled.', async () => {
    const startPromise = schedulableTask.start()
    expect(schedulableTask.status).toEqual(ResumableStatus.RUNNING)
    expect(schedulableTask.error).toBeUndefined()

    await delay(30)
    const pausePromise = schedulableTask.pause()
    expect(schedulableTask.status).toEqual(ResumableStatus.ATTEMPT_SUSPENDING)
    expect(schedulableTask.error).toBeUndefined()

    await pausePromise
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    const resumePromise = schedulableTask.resume()
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    await resumePromise
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    const cancelPromise = schedulableTask.cancel()
    await cancelPromise
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    await startPromise
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        "onStarted",
        "run --- 1",
        "pause --- 1",
        "run --- 2",
        "onCompleted",
        "pause --- 2",
      ]
    `)
  })

  it('should ignore unexpected status transition', async () => {
    const startPromise = schedulableTask.start()
    expect(schedulableTask.status).toEqual(ResumableStatus.RUNNING)
    expect(schedulableTask.error).toBeUndefined()

    await startPromise
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    const startPromise2 = schedulableTask.start()
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    await startPromise2
    expect(schedulableTask.status).toEqual(ResumableStatus.COMPLETED)
    expect(schedulableTask.error).toBeUndefined()

    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        "onStarted",
        "run --- 1",
        "run --- 2",
        "onCompleted",
      ]
    `)
  })
})

class TaskMonitorMock implements ITaskMonitor {
  public onStarted(): void {
    console.debug('onStarted')
  }

  public onSuspended(): void {
    console.debug('onSuspended')
  }

  public onResumed(): void {
    console.debug('onResumed')
  }

  public onCanceled(): void {
    console.debug('onCanceled')
  }

  public onFailed(error: unknown): void {
    console.debug(`onError: ${error}`)
  }

  public onCompleted(): void {
    console.debug('onCompleted')
  }
}

class AtomicTaskMock extends AtomicTask implements ITask {
  protected readonly total = 5
  protected index = 0

  public override async pause(): Promise<void> {
    console.debug('pause --- 1')
    await delay(Durations.pause)
    await super.pause()
    console.debug('pause --- 2')
  }

  public override async resume(): Promise<void> {
    console.debug('resume --- 1')
    await delay(Durations.resume)
    await super.resume()
    console.debug('resume --- 2')
  }

  public override async cancel(): Promise<void> {
    console.debug('cancel --- 1')
    await delay(Durations.cancel)
    await super.cancel()
    console.debug('cancel --- 2')
  }

  protected override async _run(): Promise<void> {
    console.debug('run --- 1')
    await delay(Durations.run)
    console.debug('run --- 2')
  }
}
