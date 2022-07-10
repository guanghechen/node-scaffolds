import { ChalkLogger, DEBUG } from '@guanghechen/chalk-logger'
import { copy, paste } from '@guanghechen/mini-copy'

const logger = new ChalkLogger({
  name: 'mini-copy',
  colorful: true,
  date: true,
  inline: false,
  level: DEBUG,
})

async function f(): Promise<void> {
  const string = '中国，here，hello world，好的，哦哦\n'
  await copy(string, { logger })
  const p = await paste({ logger })
  console.log(`#${p}#`)
}

void f().catch(e => console.error(e))
