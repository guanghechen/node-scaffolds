import type fs from 'fs-extra'

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
