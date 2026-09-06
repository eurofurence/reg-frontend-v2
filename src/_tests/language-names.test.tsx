import './_route-mocks'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import { languageCodes } from '~/data/languages'
import deDE from '~/localizations/de-DE.json'
import enUS from '~/localizations/en-US.json'
import { determineDefaultAddons } from '~/registration/addons'
import { loadRouteComponent, registrationData } from './_route-mocks'

let Summary: () => ReactNode
let Personal: () => ReactNode

const localizedNames = (file: typeof enUS) => file['language-name'] as Record<string, string>

beforeAll(async () => {
  Summary = await loadRouteComponent('~/routes/register/summary')
  Personal = await loadRouteComponent('~/routes/register/personal-info')
})

beforeEach(() => {
  registrationData.registration.registrationInfo = {
    ticketType: { type: 'full' },
    ticketLevel: { level: 'standard', addons: determineDefaultAddons('full') },
    personalInfo: {
      nickname: 'Johnny',
      firstName: 'John',
      lastName: 'Sergal',
      dateOfBirth: DateTime.fromISO('1990-06-15'),
      fullNamePermission: false,
      spokenLanguages: ['de', 'be'],
      pronouns: null,
      wheelchair: false,
    },
    contactInfo: {
      email: 'john@example.com',
      phoneNumber: '+49 170 1234567',
      telegramUsername: null,
      street: 'Main Street 1',
      city: 'Berlin',
      postalCode: '10115',
      stateOrProvince: null,
      country: 'DE',
    },
    optionalInfo: {
      notifications: { art: false, animation: false, music: false, fursuiting: false },
      digitalConbook: true,
      comments: null,
    },
  }
})

describe('language name localizations', () => {
  it('has every offered language in both locale files', () => {
    const missing = languageCodes.filter(
      (code) => !localizedNames(enUS)[code] || !localizedNames(deDE)[code],
    )

    expect(missing).toEqual([])
  })

  it('translates the names rather than repeating the English ones', () => {
    expect(localizedNames(deDE).de).toBe('Deutsch')
    expect(localizedNames(deDE).be).toBe('Belarussisch')
    expect(localizedNames(enUS).de).toBe('German')
  })
})

describe('spoken languages display', () => {
  it('shows names instead of raw codes on the summary', () => {
    const { container } = render(<Summary />)
    const text = container.textContent ?? ''

    expect(text).toContain('language-name.de, language-name.be')
    expect(text).not.toContain('de, be')
  })

  it('shows names instead of raw codes in the personal-info picker', () => {
    const { container } = render(<Personal />)
    const text = container.textContent ?? ''

    expect(text).toContain('language-name.de')
    expect(text).toContain('language-name.be')
  })
})
