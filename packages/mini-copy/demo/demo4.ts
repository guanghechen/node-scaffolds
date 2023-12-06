// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { paste } from '@guanghechen/mini-copy'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'

const reporter = new Reporter(chalk, {
  baseName: 'mini-copy',
  level: ReporterLevelEnum.DEBUG,
  flights: {
    colorful: true,
    date: true,
    inline: false,
  },
})

async function f(): Promise<void> {
  const p = await paste({ reporter })
  console.log(`#${p}#`)
}

void f().catch(e => console.error(e))
