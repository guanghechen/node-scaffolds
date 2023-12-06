// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { FakeClipboard, copy, paste } from '@guanghechen/mini-copy'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'
import path from 'node:path'
import url from 'node:url'

const reporter = new Reporter(chalk, {
  baseName: 'mini-copy',
  level: ReporterLevelEnum.DEBUG,
  flights: {
    colorful: true,
    date: true,
    inline: false,
  },
})

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
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
