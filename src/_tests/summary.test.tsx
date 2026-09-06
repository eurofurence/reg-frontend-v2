import './_route-mocks'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import { determineDefaultAddons } from '~/registration/addons'
import type { RegistrationInfo } from '~/registration/types'
import { loadRouteComponent, navigations, registrationData } from './_route-mocks'

let Summary: () => ReactNode

const completeInfo: RegistrationInfo = {
  preferredLocale: 'en-US',
  ticketType: { type: 'full' },
  ticketLevel: { level: 'standard', addons: determineDefaultAddons('full') },
  personalInfo: {
    nickname: 'Johnny',
    firstName: 'John',
    lastName: 'Sergal',
    dateOfBirth: DateTime.fromISO('1990-06-15'),
    fullNamePermission: false,
    spokenLanguages: ['en'],
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
    digitalConbook: false,
    comments: null,
  },
}

beforeAll(async () => {
  Summary = await loadRouteComponent('~/routes/register/summary')
})

beforeEach(() => {
  navigations.length = 0
})

describe('summary page', () => {
  it('sends an incomplete draft back to the first step instead of crashing', () => {
    registrationData.registration = {
      status: 'unsubmitted',
      registrationInfo: { ticketType: { type: 'full' } },
    }

    expect(() => render(<Summary />)).not.toThrow()
    expect(navigations).toEqual(['/register/ticket/type'])
  })

  it('links every section to its edit page', () => {
    registrationData.registration = { id: 42, status: 'new', registrationInfo: completeInfo }

    const { container } = render(<Summary />)
    const links = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'))

    expect(links).toContain('/register/personal-info')
    expect(links).toContain('/register/contact')
    expect(links).toContain('/register/optional')
    expect(navigations).toEqual([])
  })
})
