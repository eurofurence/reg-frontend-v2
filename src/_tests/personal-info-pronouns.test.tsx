import { beforeAll, describe, expect, it, mock } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

mock.module('@tanstack/react-router', () => ({
  createFileRoute: () => (opts: unknown) => opts,
  useNavigate: () => () => {},
}))

const registrationData = {
  isOpen: true,
  registration: { registrationInfo: { personalInfo: {} } },
}

mock.module('~/registration/hooks', () => ({
  useRegistrationQuery: () => ({ data: registrationData, isLoading: false }),
  useDraftRegistration: () => ({ saveDraftRegistration: () => {} }),
}))

mock.module('~/registration/autosave', () => ({
  hasDraftRegistrationInfo: () => true,
}))

mock.module('~/localization', () => ({
  useTranslations: () => (key: string) => key,
}))

mock.module('~/components/funnels/WithInvoiceRegisterFunnelLayout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

let Personal: () => ReactNode

beforeAll(async () => {
  const { Route } = await import('~/routes/register/personal-info')
  Personal = (Route as unknown as { component: () => ReactNode }).component
})

const typeInOther = (container: HTMLElement, value: string) => {
  const otherInput = container.querySelector('input[name="pronounsOther"]') as HTMLInputElement
  fireEvent.change(otherInput, { target: { value } })
  return otherInput
}

describe('personal-info pronouns sync', () => {
  it('auto-selects "other" when typing in the other field', async () => {
    const { container } = render(<Personal />)
    typeInOther(container, 'Xe/Xem')

    await waitFor(() => {
      const otherRadio = container.querySelector('input[value="other"]') as HTMLInputElement
      expect(otherRadio.checked).toBe(true)
    })
  })

  it('clears the other field when a standard option is selected', async () => {
    const { container } = render(<Personal />)
    const otherInput = typeInOther(container, 'Xe/Xem')

    await waitFor(() => {
      expect((container.querySelector('input[value="other"]') as HTMLInputElement).checked).toBe(
        true,
      )
    })

    fireEvent.click(container.querySelector('input[value="He/Him"]') as HTMLInputElement)

    await waitFor(() => {
      expect(otherInput.value).toBe('')
    })
  })
})
