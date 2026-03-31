/**
 * Tiny reusable ring buffer for hot allocations (projectiles / particles later).
 * Phase 3: structure only — simulation still uses immutable arrays for correctness.
 */
export function createRingBuffer<T>(capacity: number): {
  reset: () => void
  size: () => number
  push: (item: T) => void
  /** Oldest item or undefined if empty. */
  shift: () => T | undefined
} {
  const buf: (T | undefined)[] = Array.from({ length: capacity }, () => undefined)
  let head = 0
  let tail = 0
  let count = 0

  return {
    reset: () => {
      head = 0
      tail = 0
      count = 0
      buf.fill(undefined)
    },
    size: () => count,
    push: (item: T) => {
      if (count >= capacity) {
        head = (head + 1) % capacity
        count -= 1
      }
      buf[tail] = item
      tail = (tail + 1) % capacity
      count += 1
    },
    shift: () => {
      if (count === 0) {
        return undefined
      }
      const item = buf[head]
      buf[head] = undefined
      head = (head + 1) % capacity
      count -= 1
      return item
    },
  }
}
