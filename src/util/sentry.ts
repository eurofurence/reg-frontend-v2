import { addBreadcrumb } from '@sentry/react'

/**
 * Adds a breadcrumb for user navigation actions like clicking "Continue" or "Next"
 */
export function addNavigationBreadcrumb(
  action: string,
  step?: string,
  extra?: Record<string, any>,
) {
  addBreadcrumb({
    category: 'navigation',
    message: `User ${action}`,
    level: 'info',
    data: {
      step,
      ...extra,
    },
  })
}

/**
 * Adds a breadcrumb for user interactions like form submissions or selections
 */
export function addInteractionBreadcrumb(
  action: string,
  category: string = 'user-interaction',
  extra?: Record<string, any>,
) {
  addBreadcrumb({
    category,
    message: `User ${action}`,
    level: 'info',
    data: extra,
  })
}

/**
 * Adds a breadcrumb for registration flow progress
 */
export function addRegistrationBreadcrumb(
  step: string,
  action: string,
  extra?: Record<string, any>,
) {
  addBreadcrumb({
    category: 'registration',
    message: `Registration step: ${step} - ${action}`,
    level: 'info',
    data: {
      flow: 'registration',
      step,
      action,
      ...extra,
    },
  })
}
