/**
 * Emit a download task in browser.
 *
 * @param blob
 * @param filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // For ie browser
  if ((window.navigator as any).msSaveBlob != null) {
    ;(window.navigator as any).msSaveBlob(blob, filename)
    return
  }

  // For other browsers
  const anchor: HTMLAnchorElement = document.createElement('a')
  let url: string | null = null
  try {
    url = window.URL.createObjectURL(blob)
    anchor.style.display = 'none'
    anchor.href = url
    anchor.setAttribute('download', filename)

    // Starting download.
    document.body.appendChild(anchor)
    anchor.click()
  } finally {
    // Perform clean actions.
    document.body.removeChild(anchor)
    if (url != null) window.URL.revokeObjectURL(url)
  }
}
