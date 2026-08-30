import './_route-mocks'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import { loadRouteComponent, registrationData, savedDrafts } from './_route-mocks'

let Personal: () => ReactNode

const cleanPersonalInfo = {
  nickname: 'Johnny',
  firstName: 'John',
  lastName: 'Sergal',
  spokenLanguages: ['en'],
  dateOfBirth: DateTime.fromISO('1990-06-15'),
}

beforeAll(async () => {
  Personal = await loadRouteComponent('~/routes/register/personal-info')
})

beforeEach(() => {
  savedDrafts.length = 0
})

const submit = async (
  personalInfo: Record<string, unknown>,
  typed: Record<string, string> = {},
) => {
  registrationData.registration.registrationInfo.personalInfo = {
    ...cleanPersonalInfo,
    ...personalInfo,
  }

  const { container } = render(<Personal />)

  for (const [name, value] of Object.entries(typed)) {
    const input = container.querySelector(`input[name="${name}"]`) as HTMLInputElement
    fireEvent.change(input, { target: { value } })
  }

  fireEvent.submit(container.querySelector('form') as HTMLFormElement)

  await waitFor(() => {
    expect(savedDrafts).toHaveLength(1)
  })

  const { personalInfo: saved } = savedDrafts[0]
  if (!saved) throw new Error('the form did not submit')

  return saved
}

describe('personal-info whitespace sanitizing', () => {
  it('trims typed names', async () => {
    const personalInfo = await submit({}, { firstName: '  John  ', lastName: '  Sergal  ' })

    expect(personalInfo.firstName).toBe('John')
    expect(personalInfo.lastName).toBe('Sergal')
  })

  it('trims names carried in by a restored draft', async () => {
    const personalInfo = await submit({ firstName: '  John  ', lastName: 'Sergal\t' })

    expect(personalInfo.firstName).toBe('John')
    expect(personalInfo.lastName).toBe('Sergal')
  })

  it('strips newlines carried in by a restored draft', async () => {
    const personalInfo = await submit({
      nickname: 'Johnny\nthe\r\nSergal',
      firstName: 'Jo\nhn',
      lastName: 'Ser\ngal',
    })

    expect(personalInfo.nickname).toBe('JohnnytheSergal')
    expect(personalInfo.firstName).toBe('John')
    expect(personalInfo.lastName).toBe('Sergal')
  })
})
