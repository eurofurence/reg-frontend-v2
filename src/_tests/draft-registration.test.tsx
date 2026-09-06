import { describe, expect, it } from 'bun:test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import config from '~/config'
import { determineDefaultAddons } from '~/registration/addons'
import { deserializeRegistrationInfo } from '~/registration/autosave'
import { readDraft, useDraftRegistration } from '~/registration/draft'
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
  it('updates an unsubmitted draft and keeps it tied to the user', () => {
    const { saveDraftRegistration, getState } = renderDraftHook({
      isOpen: true,
      subject: 'user-1',
      registration: { status: 'unsubmitted', registrationInfo: { ticketType: { type: 'full' } } },
    })

    saveDraftRegistration((prev) => ({ ...prev, personalInfo: registrationInfo.personalInfo }))

    const state = getState()
    expect(state?.subject).toBe('user-1')
    expect(state?.registration?.status).toBe('unsubmitted')
    expect(state?.registration?.registrationInfo.ticketType).toEqual({ type: 'full' })
    expect(state?.registration?.registrationInfo.personalInfo?.nickname).toBe('Johnny')
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

describe('readDraft', () => {
  const draft: RegistrationQueryResult = {
    isOpen: true,
    subject: 'user-1',
    registration: { status: 'unsubmitted', registrationInfo },
    lastSavedAt: '2026-09-06T10:00:00.000Z',
  }

  it('returns the draft of the same user', () => {
    const result = readDraft(draft, 'user-1')

    expect(result?.registrationInfo.personalInfo?.nickname).toBe('Johnny')
    expect(result?.lastSavedAt).toBe('2026-09-06T10:00:00.000Z')
  })

  it('ignores a draft left behind by another user', () => {
    expect(readDraft(draft, 'user-2')).toBeNull()
  })

  it('never turns a registration that exists on the server into a draft', () => {
    expect(
      readDraft(
        {
          isOpen: true,
          subject: 'user-1',
          registration: { id: 42, status: 'new', registrationInfo },
        },
        'user-1',
      ),
    ).toBeNull()
  })

  it('ignores an empty draft', () => {
    expect(
      readDraft(
        {
          isOpen: true,
          subject: 'user-1',
          registration: { status: 'unsubmitted', registrationInfo: {} },
        },
        'user-1',
      ),
    ).toBeNull()
    expect(readDraft(undefined, 'user-1')).toBeNull()
  })
})

describe('deserializeRegistrationInfo', () => {
  it('falls back to the first day ticket day when a day ticket has no day', () => {
    const info = deserializeRegistrationInfo({ ticketType: { type: 'day' } } as any)

    expect(info?.ticketType?.type).toBe('day')
    expect(info?.ticketType?.type === 'day' && info.ticketType.day.toISODate()).toBe(
      config.dayTicketStartDate.toISODate(),
    )
  })
})
