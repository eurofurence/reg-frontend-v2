import './_route-mocks'
import { beforeAll, describe, expect, it } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { loadRouteComponent } from './_route-mocks'

let Contact: () => ReactNode

beforeAll(async () => {
  Contact = await loadRouteComponent('~/routes/register/contact')
})

const telegramInput = (container: HTMLElement) =>
  container.querySelector('input[name="telegramUsername"]') as HTMLInputElement

describe('contact telegram username', () => {
  it('prepends @ when typing a handle without one', async () => {
    const { container } = render(<Contact />)
    const input = telegramInput(container)

    fireEvent.change(input, { target: { value: 'johnnythesergal' } })

    await waitFor(() => {
      expect(input.value).toBe('@johnnythesergal')
    })
  })

  it('leaves a handle that already starts with @ unchanged', async () => {
    const { container } = render(<Contact />)
    const input = telegramInput(container)

    fireEvent.change(input, { target: { value: '@alreadyat' } })

    await waitFor(() => {
      expect(input.value).toBe('@alreadyat')
    })
  })
})
