import { copy, paste } from '@guanghechen/mini-copy'

async function f(): Promise<void> {
  const string = '中国，here，hello world，好的，哦哦'
  await copy(string)
  const p = await paste()
  console.log(`#${p}#`)
}

void f().catch(e => console.error(e))
