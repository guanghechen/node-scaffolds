import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { FakeClipboard, copy, paste } from '@guanghechen/mini-copy'
import path from 'node:path'

const reporter = new ChalkLogger({
  name: 'mini-copy',
  level: Level.DEBUG,
  flights: {
    colorful: true,
    date: true,
    inline: false,
  },
})

const fakeClipboard = new FakeClipboard({
  filepath: path.resolve(__dirname, 'fake-clipboard.txt'),
  encoding: 'utf8',
  reporter,
})

async function f(): Promise<void> {
  const string = '中国，here，hello world，好的，哦哦\n'
  await copy(string, { reporter, fakeClipboard })
  const p = await paste({ reporter, fakeClipboard })
  console.log(`#${p}#`)
}

void f().catch(e => console.error(e))
