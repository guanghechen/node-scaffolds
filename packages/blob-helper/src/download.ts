/**
 * emit a download task in browser
 * @param blob
 * @param filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)

  const a: HTMLAnchorElement = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename

  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}
