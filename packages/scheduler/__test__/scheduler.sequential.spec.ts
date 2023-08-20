import { delay } from '@guanghechen/helper-func'
import type { IConsoleMock } from '@guanghechen/helper-jest'
import { createConsoleMock } from '@guanghechen/helper-jest'
import type { IConsumerPipeline, IProviderPipeline, IScheduler, ITask } from '../src'
import {
  AtomicTask,
  BaseCommonPipeline,
  PipelineStatus,
  ResumableStatus,
  SequentialScheduler,
  isPipelineTerminated,
} from '../src'

describe('SequentialScheduler', () => {
  let pipeline: FileTaskPipelineMock
  let scheduler: IScheduler
  let consoleMock: IConsoleMock

  beforeEach(() => {
    consoleMock = createConsoleMock()
    pipeline = new FileTaskPipelineMock()
    scheduler = new SequentialScheduler({ pipeline })
  })

  afterEach(async () => {
    await scheduler.cancel()
    await pipeline.close()
  })

  it('basic', async () => {
    expect(pipeline.size).toEqual(0)
    pipeline.push({ type: 'insert', filepaths: ['a.txt'] })
    expect(pipeline.size).toEqual(1)
    pipeline.push({ type: 'insert', filepaths: ['b.txt'] })
    expect(pipeline.size).toEqual(2)

    const startPromise = scheduler.start()
    expect(pipeline.size).toEqual(1)
    expect(scheduler.status).toEqual(ResumableStatus.RUNNING)
    await scheduler.waitDrain()
    expect(pipeline.size).toEqual(0)
    expect(scheduler.status).toEqual(ResumableStatus.RUNNING)
    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        {
          "filepaths": [
            "a.txt",
          ],
          "type": "insert",
        },
        {
          "filepaths": [
            "b.txt",
          ],
          "type": "insert",
        },
      ]
    `)

    pipeline.push({ type: 'remove', filepaths: ['a.txt'] })
    pipeline.push({ type: 'modify', filepaths: ['b.txt'] })
    expect(pipeline.size).toEqual(1)
    expect(scheduler.status).toEqual(ResumableStatus.RUNNING)
    await scheduler.waitDrain()
    expect(pipeline.size).toEqual(0)
    expect(scheduler.status).toEqual(ResumableStatus.RUNNING)
    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        {
          "filepaths": [
            "a.txt",
          ],
          "type": "insert",
        },
        {
          "filepaths": [
            "b.txt",
          ],
          "type": "insert",
        },
        {
          "filepaths": [
            "a.txt",
          ],
          "type": "remove",
        },
        {
          "filepaths": [
            "b.txt",
          ],
          "type": "modify",
        },
      ]
    `)

    await scheduler.pause()
    expect(scheduler.status).toEqual(ResumableStatus.SUSPENDED)
    pipeline.push({ type: 'insert', filepaths: ['e.txt', 'f.txt'] })
    pipeline.push({ type: 'modify', filepaths: ['f.txt'] })
    expect(pipeline.size).toEqual(2)

    await scheduler.resume()
    expect(scheduler.status).toEqual(ResumableStatus.RUNNING)
    expect(pipeline.size).toEqual(1)

    await pipeline.close()
    await scheduler.waitDrain()
    await startPromise
    expect(scheduler.status).toEqual(ResumableStatus.COMPLETED)
    expect(consoleMock.getIndiscriminateAll().flat()).toMatchInlineSnapshot(`
      [
        {
          "filepaths": [
            "a.txt",
          ],
          "type": "insert",
        },
        {
          "filepaths": [
            "b.txt",
          ],
          "type": "insert",
        },
        {
          "filepaths": [
            "a.txt",
          ],
          "type": "remove",
        },
        {
          "filepaths": [
            "b.txt",
          ],
          "type": "modify",
        },
        {
          "filepaths": [
            "e.txt",
            "f.txt",
          ],
          "type": "insert",
        },
        {
          "filepaths": [
            "f.txt",
          ],
          "type": "modify",
        },
      ]
    `)
  })

  test('cancellable', async () => {
    const startPromise = scheduler.start()
    expect(pipeline.size).toEqual(0)
    pipeline.push({ type: 'insert', filepaths: ['a.txt'] })
    expect(pipeline.size).toEqual(0)
    pipeline.push({ type: 'insert', filepaths: ['b.txt'] })
    expect(pipeline.size).toEqual(1)

    await scheduler.cancel()
    expect(scheduler.status).toEqual(ResumableStatus.CANCELLED)
    await startPromise
    await expect(startPromise).resolves.toBeUndefined()

    await pipeline.close()
    expect(pipeline.size).toEqual(1)
    expect(pipeline.status).toEqual(PipelineStatus.CLOSED)
  })
})

interface ITaskData {
  type: 'insert' | 'remove' | 'modify'
  filepaths: string[]
}

class FileTask extends AtomicTask {
  protected readonly _data: ITaskData

  constructor(data: ITaskData) {
    super()
    this._data = data
  }

  protected override async _run(): Promise<void> {
    await delay(50)
    console.log(this._data)
  }
}

class FileTaskPipelineMock
  extends BaseCommonPipeline
  implements IConsumerPipeline<ITask>, IProviderPipeline<ITaskData>
{
  protected _taskDataList: ITaskData[]

  constructor() {
    super()
    this._taskDataList = []
  }

  public override get size(): number {
    return this._taskDataList.length
  }

  public pull(): ITask | undefined {
    const data = this._taskDataList.shift()
    if (data) {
      const task = new FileTask(data)
      this._batchMonitor.onPulled()
      return task
    }
    return undefined
  }

  public push(...elements: ITaskData[]): void {
    if (isPipelineTerminated(this._status)) return
    this._taskDataList.push(...elements)
    this._batchMonitor.onPushed()
  }
}
