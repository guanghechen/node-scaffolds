export async function readFromStdin(encoding: BufferEncoding): Promise<string> {
  const content: string = await new Promise<string>((resolve, reject) => {
    let ret = ''
    const stdin = process.stdin

    if (stdin.isTTY) return void resolve(ret)
    stdin
      .setEncoding(encoding)
      .on('readable', () => {
        for (let chunk; ; ret += chunk) {
          chunk = stdin.read()
          if (chunk == null) break
        }
      })
      .on('end', () => {
        resolve(ret.replace(/^([^]*?)(?:\r\n|\n\r|[\n\r])$/, '$1'))
      })
      .on('error', error => {
        reject(error)
      })
  })
  return content
}
