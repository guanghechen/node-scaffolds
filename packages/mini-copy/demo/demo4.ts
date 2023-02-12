import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { paste } from '@guanghechen/mini-copy'

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
  const p = await paste({ logger })
  console.log(`#${p}#`)
}

void f().catch(e => console.error(e))
