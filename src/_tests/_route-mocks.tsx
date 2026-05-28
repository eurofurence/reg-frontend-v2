import { mock } from 'bun:test'
import type { ReactNode } from 'react'

export const registrationData = {
  isOpen: true,
  registration: {
    status: 'unsubmitted',
    registrationInfo: { personalInfo: {}, contactInfo: {} },
  },
}

mock.module('@tanstack/react-router', () => ({
  createFileRoute: () => (opts: unknown) => opts,
  useNavigate: () => () => {},
}))

mock.module('~/registration/hooks', () => ({
  useRegistrationQuery: () => ({ data: registrationData, isLoading: false }),
  useDraftRegistration: () => ({ saveDraftRegistration: () => {} }),
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
