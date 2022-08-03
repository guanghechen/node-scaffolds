/**
 * Normalize url path.
 *
 * @param urlPath
 * @returns
 */
export const normalizeUrlPath = (urlPath: string): string => {
  const isAbsolute = urlPath.startsWith('/')
  const pathPieces = urlPath
    .split(/[/\\]+/g)
    .map(x => x.trim())
    .filter(piece => !!piece)
  const pieces: string[] = []
  for (const piece of pathPieces) {
    if (/^\./.test(piece)) {
      if (piece === '.') continue
      else if (piece === '..') {
        if (pieces.length > 0) {
          pieces.pop()
          continue
        } else if (isAbsolute) continue
      }
    }
    pieces.push(piece)
  }

  const p = pieces.join('/')
  return isAbsolute ? '/' + p : p || '.'
}
