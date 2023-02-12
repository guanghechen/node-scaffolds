import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { copy, paste } from '@guanghechen/mini-copy'

const logger = new ChalkLogger({
  name: 'mini-copy',
  level: Level.DEBUG,
  flights: {
    colorful: true,
    date: true,
    inline: false,
  },
})

async function f(): Promise<void> {
  const string = '中国，here，hello world，好的，哦哦\n'
  await copy(string, { logger })
  const p = await paste({ logger })
  console.log(`#${p}#`)
}

void f().catch(e => console.error(e))
