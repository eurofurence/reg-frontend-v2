import { describe, expect, it } from 'bun:test'
import { sanitizeSingleLine } from '../util/sanitize'

describe('sanitizeSingleLine', () => {
  it('trims surrounding whitespace', () => {
    expect(sanitizeSingleLine('  Johnny  ')).toBe('Johnny')
  })

  it('strips newlines from anywhere in the value', () => {
    expect(sanitizeSingleLine('Johnny\nthe\r\nSergal')).toBe('JohnnytheSergal')
  })

  it('trims what is left after stripping newlines', () => {
    expect(sanitizeSingleLine('\n  Johnny \n')).toBe('Johnny')
  })

  it('collapses a whitespace-only value to an empty string', () => {
    expect(sanitizeSingleLine(' \r\n\t ')).toBe('')
  })

  it('leaves an already clean value untouched', () => {
    expect(sanitizeSingleLine('Johnny the Sergal')).toBe('Johnny the Sergal')
  })

  it('keeps whitespace inside the value', () => {
    expect(sanitizeSingleLine('  Main Street 1  ')).toBe('Main Street 1')
  })
})
