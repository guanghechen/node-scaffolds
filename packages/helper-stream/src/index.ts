import { destroyBuffers } from '@guanghechen/helper-buffer'
import type { ReadableOptions } from 'node:stream'
import { Readable } from 'node:stream'

/**
 * Concatenate readable streams to async iterator.
 * @param streams
 * @returns
 * @see https://stackoverflow.com/a/62137193/10791801
 */
export async function* concatStreams(
  streams: ReadonlyArray<NodeJS.ReadableStream>,
): AsyncIterable<string | Buffer> {
  for (const stream of streams) {
    for await (const chunk of stream) yield chunk
  }
}

/**
 * Merge multiple readable streams into one readable streams.
 * @param streams
 * @param options
 * @returns
 */
export function mergeStreams(
  streams: ReadonlyArray<NodeJS.ReadableStream>,
  options?: ReadableOptions,
): NodeJS.ReadableStream {
  if (streams.length === 1) return streams[0]
  const iterable = concatStreams(streams)
  return Readable.from(iterable, options)
}

/**
 * Consume readable stream.
 *
 * @param reader
 * @param writer
 * @param transformers
 * @returns
 */
export function consumeStream(
  reader: NodeJS.ReadableStream,
  writer: NodeJS.WritableStream,
  ...transformers: NodeJS.ReadWriteStream[]
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let pipeline = reader.on('error', reject)
    for (const middleware of transformers) {
      pipeline = pipeline //
        .pipe(middleware)
        .on('error', reject)
    }
    pipeline //
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve)
  })
}

/**
 * Consume multiple streams serially.
 *
 * @param readers
 * @param writer
 * @param transformers
 */
export function consumeStreams(
  readers: ReadonlyArray<NodeJS.ReadableStream>,
  writer: NodeJS.WritableStream,
  ...transformers: NodeJS.ReadWriteStream[]
): Promise<void> {
  const readable = mergeStreams(readers)
  return consumeStream(readable, writer, ...transformers)
}

/**
 * Consume read stream and encode the contents into buffer.
 *
 * @param stream
 * @param safe
 * @returns
 */
export async function stream2buffer(stream: NodeJS.ReadableStream, safe: boolean): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const result = Buffer.concat(chunks)
  if (safe) destroyBuffers(chunks)
  return result
}
