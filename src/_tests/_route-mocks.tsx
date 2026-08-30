import { mock } from 'bun:test'
import type { ReactNode } from 'react'
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
      savedDrafts.push(update({}))
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

export const loadRouteComponent = async (path: string) => {
  const { Route } = (await import(path)) as { Route: { component: () => ReactNode } }
  return Route.component
}
