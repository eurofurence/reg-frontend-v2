import { describe, expect, it } from 'bun:test'
import { render, screen } from '@testing-library/react'
import InvoiceItem from '../components/invoice/InvoiceItem'

describe('InvoiceItem link', () => {
  it('renders a link when url and linktext are provided', () => {
    render(
      <InvoiceItem
        amount={1}
        name="Fursuit Badge (free)"
        price={0}
        url="https://fursuit.eurofurence.org"
        linktext="customize"
      />,
    )

    const link = screen.getByRole('link', { name: 'customize' })
    expect(link.getAttribute('href')).toBe('https://fursuit.eurofurence.org')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('renders no link when url is absent', () => {
    render(<InvoiceItem amount={2} name="Dead Dog Party" price={0} />)

    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders extra text when provided', () => {
    render(<InvoiceItem amount={1} name="T-shirt" price={25} extra="wM" />)

    expect(screen.getByText('wM')).toBeTruthy()
  })
})
