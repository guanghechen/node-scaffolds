<header>
  <div align="center">
    <a href="#license">
      <img
        alt="License"
        src="https://img.shields.io/github/license/guanghechen/node-scaffolds"
      />
    </a>
    <a href="https://github.com/guanghechen/node-scaffolds/tags">
      <img
        alt="Package Version"
        src="https://img.shields.io/github/v/tag/guanghechen/node-scaffolds?include_prereleases&sort=semver"
      />
    </a>
    <a href="https://github.com/guanghechen/node-scaffolds/search?l=typescript">
      <img
        alt="Github Top Language"
        src="https://img.shields.io/github/languages/top/guanghechen/node-scaffolds"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/rollup-config-tsx"
      />
    </a>
    <a href="https://github.com/guanghechen/node-scaffolds/actions/workflows/ci.yml">
      <img
        alt="CI Workflow"
        src="https://github.com/guanghechen/node-scaffolds/workflows/Build/badge.svg?branch=main"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>

```typescript
/**
 * Consume multiple streams serially.
 *
 * @param streams
 * @param writer
 */
export async function consumeStreams(
  streams: fs.ReadStream[],
  writer: fs.WriteStream,
): Promise<void> {
  for (const stream of streams) {
    await new Promise<void>((resolve, reject) => {
      stream
        .on('error', reject)
        .on('finish', resolve)
        .on('close', resolve)
        .pipe(writer, { end: false })
    })
  }
}
```

```typescript
/**
 * Merge multiple read streams into Buffer serially.
 *
 * !!!The content returned by the reading stream should be Buffer instead of
 * string.
 *
 * @param stream
 * @param safeMode If true, the temporary chunks middle will be destroyed
 * @returns
 */
export async function streams2buffer(
  streams: fs.ReadStream[],
  safeMode = true,
): Promise<Buffer> {
  const chunks: Buffer[] = []
  for (const stream of streams) {
    await new Promise<void>((resolve, reject) => {
      stream
        .on('data', (chunk: Buffer) => chunks.push(chunk))
        .on('error', reject)
        .on('end', resolve)
    })
  }

  const result = Buffer.concat(chunks)
  if (safeMode) destroyBuffers(chunks)
  return result
}
```