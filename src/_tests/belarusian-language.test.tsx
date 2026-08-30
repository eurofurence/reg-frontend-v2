import { describe, expect, it } from 'bun:test'
import { languageCodes } from '~/data/languages'
import deDE from '~/localizations/de-DE.json'
import enUS from '~/localizations/en-US.json'

describe('Belarusian language', () => {
  it('includes Belarusian in the curated language list', () => {
    expect(languageCodes).toContain('be')
  })

  it('preserves the curated languages that ISO-639-1 lacks', () => {
    expect(languageCodes).toContain('tlh')
    expect(languageCodes).toContain('dsb')
    expect(languageCodes).toContain('en')
  })

  it('has the be language-name entry in both localizations', () => {
    expect((enUS['language-name'] as Record<string, string>).be).toBe('Belarusian')
    expect((deDE['language-name'] as Record<string, string>).be).toBe('Belarussisch')
  })
})
