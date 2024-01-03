export function delay(duration: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, duration))
}
