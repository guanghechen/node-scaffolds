import fs from 'node:fs/promises'

export async function loadJson<T>(filepath: string): Promise<T> {
  const content = await fs.readFile(filepath, 'utf8')
  return JSON.parse(content)
}

export const npmNamePattern: string = /(?:@[\w.-]+\/)?[\w.-]+/.source
export const versionPattern: string =
  /\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.\d*[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.\d*[0-9A-Za-z-]+)*)?/
    .source
export const tagNamePattern: string = new RegExp(
  `(?:(?:${npmNamePattern}@|[\\w-]*)(?:${versionPattern})|[^\\\\/'"]+)`,
).source
