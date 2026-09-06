import { mock } from 'bun:test'
import type { ReactNode } from 'react'
import * as authsrv from '~/apis/authsrv'
import config from '~/config'
import * as localization from '~/localization'
import type { RegistrationInfo, RegistrationStatus } from '~/registration/types'

export const registrationData: {
  isOpen: boolean
  registration: {
    id?: number
    status: RegistrationStatus
    registrationInfo: Partial<RegistrationInfo>
  }
} = {
  isOpen: true,
  registration: {
    status: 'unsubmitted',
    registrationInfo: {},
  },
}

export const navigations: string[] = []
const navigate = (opts: { href: string }) => {
  navigations.push(opts.href)
}

mock.module('@tanstack/react-router', () => ({
  createFileRoute: () => (opts: unknown) => opts,
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
  useNavigate: () => navigate,
}))

export const savedDrafts: Partial<RegistrationInfo>[] = []
export const updateCalls: { id: number; registrationInfo: Partial<RegistrationInfo> }[] = []

mock.module('~/registration/hooks', () => ({
  useRegistrationQuery: () => ({ data: registrationData, isLoading: false }),
  useDraftRegistration: () => ({
    saveDraftRegistration: (
      update: (prev: Partial<RegistrationInfo>) => Partial<RegistrationInfo>,
    ) => {
      const next = update(registrationData.registration.registrationInfo)
      savedDrafts.push(next)
      if (registrationData.registration.status === 'unsubmitted') {
        registrationData.registration.registrationInfo = next
      }
    },
  }),
  useSubmitRegistrationMutation: () => ({ mutate: () => {} }),
  useUpdateRegistrationMutation: () => ({
    mutate: (
      variables: { id: number; registrationInfo: Partial<RegistrationInfo> },
      options?: { onSuccess?: () => void },
    ) => {
      updateCalls.push(variables)
      options?.onSuccess?.()
    },
  }),
}))

// Module mocks leak into every file of a plain `bun test` run, so keep the real exports
// around for the tests that exercise these modules directly.
mock.module('~/localization', () => ({
  ...localization,
  useTranslations: () => (key: string) => key,
  useCurrentLocale: () => 'en-US',
}))

mock.module('~/apis/authsrv', () => ({
  ...authsrv,
  useUserInfoQuery: () => ({ data: undefined }),
}))

mock.module('~/components/funnels/WithInvoiceRegisterFunnelLayout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

mock.module('~/components/funnels/FullWidthRegisterFunnelLayout', () => ({
  default: ({ children, onNext }: { children: ReactNode; onNext?: () => void }) => (
    <>
      {children}
      <button type="button" data-testid="funnel-next" onClick={onNext}>
        next
      </button>
    </>
  ),
}))

mock.module('~/hooks/useEurofurenceDates', () => ({
  useEurofurenceDates: () => ({
    dates: {
      registrationLaunch: config.registrationLaunch,
      registrationExpiration: config.registrationExpirationDate,
      conventionStart: config.eventStartDate,
      conventionEnd: config.eventEndDate,
    },
    isLoading: false,
    error: null,
  }),
}))

export const loadRouteComponent = async (path: string) => {
  const { Route } = (await import(path)) as { Route: { component: () => ReactNode } }
  return Route.component
}
