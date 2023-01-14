import fs from 'fs-extra'

export async function replaceInFile(options: {
  filepath: string
  from: string
  to: string
  encoding: BufferEncoding
}): Promise<void> {
  const { filepath, from, to, encoding } = options
  const content = await fs.readFile(filepath, { encoding })
  const resolvedContent = content.replaceAll(from, to)
  await fs.writeFile(filepath, resolvedContent, { encoding })
}
