import { describe, expect, it } from 'bun:test'
import { processDatePlaceholders } from '~/localization'
import deDE from '~/localizations/de-DE.json'
import enUS from '~/localizations/en-US.json'

type Dictionary = Record<string, unknown>

const priceLabel = (dictionary: Dictionary, level: string) =>
  (dictionary[`register-ticket-level-card-${level}`] as { priceLabel: string }).priceLabel

const sizeLabels = '{$value ->\n[XS]  X-Small\n*[S]  Small\n[wS]  Small (Ladies Cut)\n}'

describe('Fluent select expressions', () => {
  it('picks the variant matching the variable', () => {
    expect(processDatePlaceholders(priceLabel(enUS, 'standard'), { type: 'day' }, 'en-US')).toBe(
      'Standard Day Ticket',
    )
    expect(processDatePlaceholders(priceLabel(enUS, 'sponsor'), { type: 'day' }, 'en-US')).toBe(
      'Sponsor Day Ticket',
    )
  })

  it('uses the default variant marked with *', () => {
    expect(processDatePlaceholders(priceLabel(enUS, 'standard'), { type: 'full' }, 'en-US')).toBe(
      'Standard Ticket',
    )
    expect(processDatePlaceholders(priceLabel(enUS, 'standard'), {}, 'en-US')).toBe(
      'Standard Ticket',
    )
  })

  it('works with the German dictionary', () => {
    expect(processDatePlaceholders(priceLabel(deDE, 'sponsor'), { type: 'day' }, 'de-DE')).toBe(
      'Sponsor-Tagesticket',
    )
    expect(processDatePlaceholders(priceLabel(deDE, 'sponsor'), { type: 'full' }, 'de-DE')).toBe(
      'Sponsor-Ticket',
    )
  })

  it('handles a default variant in the middle of the list', () => {
    expect(processDatePlaceholders(sizeLabels, { value: 'XS' }, 'en-US')).toBe('X-Small')
    expect(processDatePlaceholders(sizeLabels, { value: 'S' }, 'en-US')).toBe('Small')
    expect(processDatePlaceholders(sizeLabels, { value: 'wS' }, 'en-US')).toBe('Small (Ladies Cut)')
    expect(processDatePlaceholders(sizeLabels, { value: 'nope' }, 'en-US')).toBe('Small')
  })
})
