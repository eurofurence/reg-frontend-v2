import './_route-mocks'
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import config from '~/config'
import { determineDefaultAddons } from '~/registration/addons'
import { loadRouteComponent, registrationData, savedDrafts } from './_route-mocks'

let Level: () => ReactNode
let TicketType: () => ReactNode

beforeAll(async () => {
  Level = await loadRouteComponent('~/routes/register/ticket/level')
  TicketType = await loadRouteComponent('~/routes/register/ticket/type')
})

beforeEach(() => {
  savedDrafts.length = 0
  registrationData.registration.registrationInfo = { ticketType: { type: 'full' } }
})

const submitLevelPage = async () => {
  const { container } = render(<Level />)

  fireEvent.submit(container.querySelector('form') as HTMLFormElement)

  await waitFor(() => {
    expect(savedDrafts.length).toBeGreaterThan(0)
  })

  const { ticketLevel } = savedDrafts[savedDrafts.length - 1]
  if (!ticketLevel) throw new Error('the level page did not submit')

  return ticketLevel
}

describe('determineDefaultAddons', () => {
  it('selects the addons that default to on for a full ticket', () => {
    const addons = determineDefaultAddons('full')

    expect(addons['stage-pass'].selected).toBe(true)
    expect(addons.late.selected).toBe(true)
  })

  it('leaves opt-in addons unselected', () => {
    const addons = determineDefaultAddons('full')

    expect(addons.tshirt.selected).toBe(false)
    expect(addons.early.selected).toBe(false)
    expect(addons.benefactor.selected).toBe(false)
  })

  it('drops addons that are unavailable for day tickets', () => {
    const addons = determineDefaultAddons('day')

    expect(addons['stage-pass'].selected).toBe(false)
    expect(addons.late.selected).toBe(false)
  })

  it('covers every configured addon', () => {
    const addons = determineDefaultAddons('full')

    expect(Object.keys(addons).sort()).toEqual(Object.keys(config.addons).sort())
  })
})

describe('ticket level submit', () => {
  it('carries the default addons through without touching the form', async () => {
    const ticketLevel = await submitLevelPage()

    expect(ticketLevel.addons['stage-pass'].selected).toBe(true)
    expect(ticketLevel.addons.late.selected).toBe(true)
  })

  it('keeps opt-in addons off', async () => {
    const ticketLevel = await submitLevelPage()

    expect(ticketLevel.addons.tshirt.selected).toBe(false)
    expect(ticketLevel.addons.early.selected).toBe(false)
  })

  it('leaves out addons a day ticket cannot have', async () => {
    registrationData.registration.registrationInfo = {
      ticketType: { type: 'day', day: DateTime.fromISO('2026-08-20') },
    }

    const ticketLevel = await submitLevelPage()

    expect(ticketLevel.addons['stage-pass'].selected).toBe(false)
    expect(ticketLevel.addons.late.selected).toBe(false)
  })
})

describe('ticket type switch', () => {
  const submitType = async (type: 'full' | 'day') => {
    const { container } = render(<TicketType />)

    fireEvent.click(container.querySelector(`input[value="${type}"]`) as HTMLInputElement)
    savedDrafts.length = 0
    fireEvent.click(container.querySelector('[data-testid="funnel-next"]') as HTMLButtonElement)

    await waitFor(() => {
      expect(savedDrafts.length).toBeGreaterThan(0)
    })

    return savedDrafts[savedDrafts.length - 1]
  }

  it('resets addons to the day defaults when switching from full to day', async () => {
    registrationData.registration.registrationInfo = {
      ticketType: { type: 'full' },
      ticketLevel: { level: 'standard', addons: determineDefaultAddons('full') },
    }

    const draft = await submitType('day')

    expect(draft.ticketLevel?.addons['stage-pass'].selected).toBe(false)
    expect(draft.ticketLevel?.addons.late.selected).toBe(false)
  })

  it('restores the full defaults when switching back to full', async () => {
    registrationData.registration.registrationInfo = {
      ticketType: { type: 'day', day: DateTime.fromISO('2026-08-20') },
      ticketLevel: { level: 'standard', addons: determineDefaultAddons('day') },
    }

    const draft = await submitType('full')

    expect(draft.ticketLevel?.addons['stage-pass'].selected).toBe(true)
    expect(draft.ticketLevel?.addons.late.selected).toBe(true)
  })

  it('clears the chosen level so it gets picked again for the new type', async () => {
    registrationData.registration.registrationInfo = {
      ticketType: { type: 'full' },
      ticketLevel: { level: 'sponsor', addons: determineDefaultAddons('full') },
    }

    const draft = await submitType('day')

    expect(draft.ticketLevel?.level).toBeNull()
  })

  it('leaves the level alone when the type is unchanged', async () => {
    registrationData.registration.registrationInfo = {
      ticketType: { type: 'full' },
      ticketLevel: { level: 'sponsor', addons: determineDefaultAddons('full') },
    }

    const draft = await submitType('full')

    expect(draft.ticketLevel?.level).toBe('sponsor')
  })
})
