import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { FakeClipboard, copy, paste } from '@guanghechen/mini-copy'
import path from 'node:path'

const logger = new ChalkLogger({
  name: 'mini-copy',
  level: Level.DEBUG,
  flags: {
    colorful: true,
    date: true,
    inline: false,
  },
})

const fakeClipboard = new FakeClipboard({
  filepath: path.resolve(__dirname, 'fake-clipboard.txt'),
  encoding: 'utf8',
  logger,
})

async function f(): Promise<void> {
  const string = '中国，here，hello world，好的，哦哦\n'
  await copy(string, { logger, fakeClipboard })
  const p = await paste({ logger, fakeClipboard })
  console.log(`#${p}#`)
}

void f().catch(e => console.error(e))
