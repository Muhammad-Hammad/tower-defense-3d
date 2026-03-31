import { describe, expect, it } from 'vitest'
import { findPath } from './pathfinding'

describe('findPath', () => {
  it('finds a straight segment when nothing is blocked', () => {
    const blocked = new Set<string>()
    const p = findPath({ gx: 2, gz: 11 }, { gx: 6, gz: 11 }, blocked)
    expect(p).not.toBeNull()
    expect(p!.length).toBeGreaterThanOrEqual(2)
    expect(p![0]).toEqual({ gx: 2, gz: 11 })
    expect(p![p!.length - 1]).toEqual({ gx: 6, gz: 11 })
  })

  it('returns null when the goal cell is blocked', () => {
    const blocked = new Set<string>(['21,11'])
    const p = findPath({ gx: 2, gz: 11 }, { gx: 21, gz: 11 }, blocked)
    expect(p).toBeNull()
  })
})
