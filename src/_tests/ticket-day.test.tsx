import './_route-mocks'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import { loadRouteComponent, registrationData, savedDrafts } from './_route-mocks'

let Day: () => ReactNode

beforeAll(async () => {
  Day = await loadRouteComponent('~/routes/register/ticket/day')
})

beforeEach(() => {
  savedDrafts.length = 0
  registrationData.registration = {
    status: 'unsubmitted',
    registrationInfo: {
      ticketType: { type: 'day', day: DateTime.fromISO('2026-08-20', { zone: 'Europe/Berlin' }) },
    },
  }
})

const dayInputs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input[name="day"]')) as HTMLInputElement[]

describe('day ticket page', () => {
  it('offers exactly the day ticket days as convention dates', () => {
    const { container } = render(<Day />)

    expect(dayInputs(container).map((input) => input.value)).toEqual([
      '2026-08-19',
      '2026-08-20',
      '2026-08-21',
      '2026-08-22',
    ])
  })

  it('preselects the day from the draft', () => {
    const { container } = render(<Day />)

    expect(dayInputs(container).find((input) => input.checked)?.value).toBe('2026-08-20')
  })

  it('saves the picked convention day', async () => {
    const { container } = render(<Day />)

    fireEvent.click(dayInputs(container)[3])
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    await waitFor(() => {
      expect(savedDrafts.length).toBeGreaterThan(0)
    })

    const saved = savedDrafts[savedDrafts.length - 1].ticketType
    expect(saved?.type === 'day' && saved.day.toISODate()).toBe('2026-08-22')
    expect(saved?.type === 'day' && saved.day.weekdayLong).toBe('Saturday')
  })
})
