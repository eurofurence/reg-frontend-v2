import { describe, expect, it } from 'bun:test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import { determineDefaultAddons } from '~/registration/addons'
import { useDraftRegistration } from '~/registration/draft'
import { type RegistrationQueryResult, registrationQueryKey } from '~/registration/query'
import type { RegistrationInfo } from '~/registration/types'

const registrationInfo: RegistrationInfo = {
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

const renderDraftHook = (state: RegistrationQueryResult) => {
  const queryClient = new QueryClient()
  queryClient.setQueryData(registrationQueryKey, state)

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useDraftRegistration(), { wrapper })

  return {
    saveDraftRegistration: result.current.saveDraftRegistration,
    getState: () => queryClient.getQueryData<RegistrationQueryResult>(registrationQueryKey),
  }
}

describe('saveDraftRegistration', () => {
  it('updates an unsubmitted draft', () => {
    const { saveDraftRegistration, getState } = renderDraftHook({
      isOpen: true,
      registration: { status: 'unsubmitted', registrationInfo: { ticketType: { type: 'full' } } },
    })

    saveDraftRegistration((prev) => ({ ...prev, personalInfo: registrationInfo.personalInfo }))

    const registration = getState()?.registration
    expect(registration?.status).toBe('unsubmitted')
    expect(registration?.registrationInfo.ticketType).toEqual({ type: 'full' })
    expect(registration?.registrationInfo.personalInfo?.nickname).toBe('Johnny')
  })

  it('leaves a registration that exists on the server untouched', () => {
    const submitted: RegistrationQueryResult = {
      isOpen: true,
      registration: { id: 42, status: 'new', registrationInfo },
    }
    const { saveDraftRegistration, getState } = renderDraftHook(submitted)

    saveDraftRegistration((prev) => ({
      ...prev,
      personalInfo: { ...registrationInfo.personalInfo, nickname: 'Changed' },
    }))

    expect(getState()).toBe(submitted)
  })
})
