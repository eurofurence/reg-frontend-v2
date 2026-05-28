import { describe, expect, it } from 'bun:test'
import { languageNames } from '~/data/languages'
import deDE from '~/localizations/de-DE.json'
import enUS from '~/localizations/en-US.json'

describe('Belarusian language', () => {
  it('includes Belarusian in the vendored language list', () => {
    expect(languageNames.be).toBe('Belarusian')
  })

  it('preserves the curated languages that ISO-639-1 lacks', () => {
    expect(languageNames.tlh).toBe('Klingon')
    expect(languageNames.dsb).toBe('Lower Sorbian')
    expect(languageNames.en).toBe('English')
  })

  it('has the be language-name entry in both localizations', () => {
    expect((enUS['language-name'] as Record<string, string>).be).toBe('Belarusian')
    expect((deDE['language-name'] as Record<string, string>).be).toBe('Belarussisch')
  })
})
