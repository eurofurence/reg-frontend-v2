import { describe, expect, it, mock } from 'bun:test'
import { addBreadcrumb } from '@sentry/react'
import {
  addInteractionBreadcrumb,
  addNavigationBreadcrumb,
  addRegistrationBreadcrumb,
} from '../util/sentry'

// Mock Sentry's addBreadcrumb function
mock.module('@sentry/react', () => ({
  addBreadcrumb: mock(),
}))

describe('Sentry Utility Functions', () => {
  it('should add navigation breadcrumb with correct parameters', () => {
    const mockAddBreadcrumb = addBreadcrumb as ReturnType<typeof mock>

    addNavigationBreadcrumb('clicked continue', 'funnel-step', {
      isEditMode: false,
      isLastPage: false,
    })

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: 'navigation',
      message: 'User clicked continue',
      level: 'info',
      data: {
        step: 'funnel-step',
        isEditMode: false,
        isLastPage: false,
      },
    })
  })

  it('should add navigation breadcrumb without extra data', () => {
    const mockAddBreadcrumb = addBreadcrumb as ReturnType<typeof mock>

    addNavigationBreadcrumb('clicked back')

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: 'navigation',
      message: 'User clicked back',
      level: 'info',
      data: {},
    })
  })

  it('should add interaction breadcrumb with custom category', () => {
    const mockAddBreadcrumb = addBreadcrumb as ReturnType<typeof mock>

    addInteractionBreadcrumb('selected option', 'ui-interaction', {
      optionId: 'full-ticket',
    })

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: 'ui-interaction',
      message: 'User selected option',
      level: 'info',
      data: { optionId: 'full-ticket' },
    })
  })

  it('should add interaction breadcrumb with default category', () => {
    const mockAddBreadcrumb = addBreadcrumb as ReturnType<typeof mock>

    addInteractionBreadcrumb('clicked button')

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: 'user-interaction',
      message: 'User clicked button',
      level: 'info',
      data: undefined,
    })
  })

  it('should add registration breadcrumb with step and action', () => {
    const mockAddBreadcrumb = addBreadcrumb as ReturnType<typeof mock>

    addRegistrationBreadcrumb('ticket-type', 'selected', {
      ticketType: 'full',
    })

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: 'registration',
      message: 'Registration step: ticket-type - selected',
      level: 'info',
      data: {
        flow: 'registration',
        step: 'ticket-type',
        action: 'selected',
        ticketType: 'full',
      },
    })
  })

  it('should add registration breadcrumb without extra data', () => {
    const mockAddBreadcrumb = addBreadcrumb as ReturnType<typeof mock>

    addRegistrationBreadcrumb('personal-info', 'submitted')

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      category: 'registration',
      message: 'Registration step: personal-info - submitted',
      level: 'info',
      data: {
        flow: 'registration',
        step: 'personal-info',
        action: 'submitted',
      },
    })
  })
})
