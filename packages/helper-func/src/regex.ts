export function escapeRegexSpecialChars(source: string): string {
  return source.replace(/([.*+?|^$()[\]{}\\])/g, '\\$1')
}
