import { mock } from 'bun:test'
import type { ReactNode } from 'react'
import config from '~/config'
import type { RegistrationInfo, RegistrationStatus } from '~/registration/types'

export const registrationData: {
  isOpen: boolean
  registration: {
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

mock.module('@tanstack/react-router', () => ({
  createFileRoute: () => (opts: unknown) => opts,
  useNavigate: () => () => {},
}))

export const savedDrafts: Partial<RegistrationInfo>[] = []

mock.module('~/registration/hooks', () => ({
  useRegistrationQuery: () => ({ data: registrationData, isLoading: false }),
  useDraftRegistration: () => ({
    saveDraftRegistration: (
      update: (prev: Partial<RegistrationInfo>) => Partial<RegistrationInfo>,
    ) => {
      savedDrafts.push(update(registrationData.registration.registrationInfo))
    },
  }),
  useSubmitRegistrationMutation: () => ({ mutate: () => {} }),
}))

mock.module('~/registration/autosave', () => ({
  hasDraftRegistrationInfo: () => true,
}))

mock.module('~/localization', () => ({
  useTranslations: () => (key: string) => key,
  useCurrentLocale: () => 'en-US',
}))

mock.module('~/apis/authsrv', () => ({
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
