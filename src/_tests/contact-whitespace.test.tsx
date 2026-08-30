import './_route-mocks'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { loadRouteComponent, registrationData, savedDrafts } from './_route-mocks'

let Contact: () => ReactNode

const cleanContact = {
  email: 'john@example.com',
  phoneNumber: '+49 170 1234567',
  street: 'Main Street 1',
  postalCode: '10115',
  city: 'Berlin',
  country: 'DE',
}

beforeAll(async () => {
  Contact = await loadRouteComponent('~/routes/register/contact')
})

beforeEach(() => {
  savedDrafts.length = 0
})

const submitRestoredDraft = async (contactInfo: Record<string, unknown>) => {
  registrationData.registration.registrationInfo.contactInfo = { ...cleanContact, ...contactInfo }

  const { container } = render(<Contact />)
  fireEvent.submit(container.querySelector('form') as HTMLFormElement)

  await waitFor(() => {
    expect(savedDrafts).toHaveLength(1)
  })

  const { contactInfo: saved } = savedDrafts[0]
  if (!saved) throw new Error('the form did not submit')

  return saved
}

describe('contact whitespace sanitizing', () => {
  it('strips newlines carried in by a restored draft', async () => {
    const contactInfo = await submitRestoredDraft({
      street: 'Main\nStreet 1',
      city: 'Ber\r\nlin',
      postalCode: '101\n15',
    })

    expect(contactInfo.street).toBe('MainStreet 1')
    expect(contactInfo.city).toBe('Berlin')
    expect(contactInfo.postalCode).toBe('10115')
  })

  it('trims values carried in by a restored draft', async () => {
    const contactInfo = await submitRestoredDraft({
      phoneNumber: '  +49 170 1234567  ',
      street: '  Main Street 1  ',
      city: '  Berlin  ',
    })

    expect(contactInfo.phoneNumber).toBe('+49 170 1234567')
    expect(contactInfo.street).toBe('Main Street 1')
    expect(contactInfo.city).toBe('Berlin')
  })

  it('nulls a state or province that is only whitespace', async () => {
    const contactInfo = await submitRestoredDraft({ stateOrProvince: ' \n ' })

    expect(contactInfo.stateOrProvince).toBeNull()
  })

  it('keeps the @ when trimming a telegram username', async () => {
    const contactInfo = await submitRestoredDraft({ telegramUsername: '@johnnythesergal  ' })

    expect(contactInfo.telegramUsername).toBe('@johnnythesergal')
  })
})
