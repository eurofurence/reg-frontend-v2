import './_route-mocks'
import { beforeAll, describe, expect, it } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { loadRouteComponent } from './_route-mocks'

let Personal: () => ReactNode

beforeAll(async () => {
  Personal = await loadRouteComponent('~/routes/register/personal-info')
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
