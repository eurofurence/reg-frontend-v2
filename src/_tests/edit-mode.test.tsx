import './_route-mocks'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import { determineDefaultAddons } from '~/registration/addons'
import type { RegistrationInfo } from '~/registration/types'
import {
  loadRouteComponent,
  navigations,
  registrationData,
  savedDrafts,
  updateCalls,
} from './_route-mocks'

let Level: () => ReactNode
let Personal: () => ReactNode
let Contact: () => ReactNode
let Optional: () => ReactNode

const existingInfo: RegistrationInfo = {
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
  Level = await loadRouteComponent('~/routes/register/ticket/level')
  Personal = await loadRouteComponent('~/routes/register/personal-info')
  Contact = await loadRouteComponent('~/routes/register/contact')
  Optional = await loadRouteComponent('~/routes/register/optional')
})

beforeEach(() => {
  savedDrafts.length = 0
  updateCalls.length = 0
  navigations.length = 0
  registrationData.registration = { id: 42, status: 'new', registrationInfo: existingInfo }
})

const submitForm = (container: HTMLElement) =>
  fireEvent.submit(container.querySelector('form') as HTMLFormElement)

const setInput = (container: HTMLElement, name: string, value: string) =>
  fireEvent.change(container.querySelector(`input[name="${name}"]`) as HTMLInputElement, {
    target: { value },
  })

describe('editing an existing registration', () => {
  it('sends changed personal info to the server and returns to the summary', async () => {
    const { container } = render(<Personal />)

    setInput(container, 'nickname', 'Johnny2')
    submitForm(container)

    await waitFor(() => {
      expect(updateCalls).toHaveLength(1)
    })

    expect(updateCalls[0].id).toBe(42)
    expect(updateCalls[0].registrationInfo.personalInfo?.nickname).toBe('Johnny2')
    expect(updateCalls[0].registrationInfo.contactInfo).toEqual(existingInfo.contactInfo)
    expect(updateCalls[0].registrationInfo.ticketLevel).toEqual(existingInfo.ticketLevel)
    expect(savedDrafts).toHaveLength(0)
    expect(navigations).toEqual(['/register/summary'])
  })

  it('sends changed contact info to the server and returns to the summary', async () => {
    const { container } = render(<Contact />)

    setInput(container, 'street', 'Other Street 2')
    submitForm(container)

    await waitFor(() => {
      expect(updateCalls).toHaveLength(1)
    })

    expect(updateCalls[0].id).toBe(42)
    expect(updateCalls[0].registrationInfo.contactInfo?.street).toBe('Other Street 2')
    expect(updateCalls[0].registrationInfo.contactInfo?.email).toBe('john@example.com')
    expect(updateCalls[0].registrationInfo.personalInfo).toEqual(existingInfo.personalInfo)
    expect(savedDrafts).toHaveLength(0)
    expect(navigations).toEqual(['/register/summary'])
  })

  it('sends changed optional info to the server and returns to the summary', async () => {
    const { container } = render(<Optional />)

    fireEvent.click(container.querySelector('input[name="digitalConbook"]') as HTMLInputElement)
    submitForm(container)

    await waitFor(() => {
      expect(updateCalls).toHaveLength(1)
    })

    expect(updateCalls[0].id).toBe(42)
    expect(updateCalls[0].registrationInfo.optionalInfo?.digitalConbook).toBe(true)
    expect(updateCalls[0].registrationInfo.personalInfo).toEqual(existingInfo.personalInfo)
    expect(savedDrafts).toHaveLength(0)
    expect(navigations).toEqual(['/register/summary'])
  })

  it('sends a changed ticket level to the server and returns to the summary', async () => {
    const { container } = render(<Level />)

    fireEvent.click(container.querySelector('input[value="contributor"]') as HTMLInputElement)
    submitForm(container)

    await waitFor(() => {
      expect(updateCalls).toHaveLength(1)
    })

    expect(updateCalls[0].id).toBe(42)
    expect(updateCalls[0].registrationInfo.ticketLevel?.level).toBe('contributor')
    expect(updateCalls[0].registrationInfo.ticketType).toEqual({ type: 'full' })
    expect(updateCalls[0].registrationInfo.personalInfo).toEqual(existingInfo.personalInfo)
    expect(navigations).toEqual(['/register/summary'])
  })
})

describe('filling in a new registration', () => {
  beforeEach(() => {
    registrationData.registration = { status: 'unsubmitted', registrationInfo: existingInfo }
  })

  it('keeps saving the draft and moving to the next step', async () => {
    const { container } = render(<Personal />)

    setInput(container, 'nickname', 'Johnny2')
    submitForm(container)

    await waitFor(() => {
      expect(savedDrafts).toHaveLength(1)
    })

    expect(savedDrafts[0].personalInfo?.nickname).toBe('Johnny2')
    expect(updateCalls).toHaveLength(0)
    expect(navigations).toEqual(['/register/contact'])
  })
})
