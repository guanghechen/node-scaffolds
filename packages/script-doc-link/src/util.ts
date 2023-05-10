import fs from 'node:fs/promises'

export async function loadJson<T>(filepath: string): Promise<T> {
  const content = await fs.readFile(filepath, 'utf8')
  return JSON.parse(content)
}
