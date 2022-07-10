import { ChalkLogger, DEBUG } from '@guanghechen/chalk-logger'
import { paste } from '@guanghechen/mini-copy'

const logger = new ChalkLogger({
  name: 'mini-copy',
  colorful: true,
  date: true,
  inline: false,
  level: DEBUG,
})

async function f(): Promise<void> {
  const p = await paste({ logger })
  console.log(`#${p}#`)
}

void f().catch(e => console.error(e))
