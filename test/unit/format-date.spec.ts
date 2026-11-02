import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDate } from '../../app/utils/formatDate'

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-30T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const ago = (seconds: number) => new Date(Date.now() - seconds * 1000).toISOString()

  it('formats seconds', () => {
    expect(formatDate(ago(0))).toBe('just now')
    expect(formatDate(ago(30))).toBe('30 seconds ago')
  })

  it('formats minutes', () => {
    expect(formatDate(ago(60))).toBe('1 minute ago')
    expect(formatDate(ago(60 * 45))).toBe('45 minutes ago')
  })

  it('formats hours', () => {
    expect(formatDate(ago(3600))).toBe('1 hour ago')
    expect(formatDate(ago(3600 * 23))).toBe('23 hours ago')
  })

  it('shows the date after 24 hours', () => {
    expect(formatDate('2026-10-20T12:00:00Z')).toBe('Oct 20, 2026')
  })
})
