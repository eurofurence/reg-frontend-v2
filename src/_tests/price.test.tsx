import { describe, expect, it } from 'bun:test'
import { render, screen } from '@testing-library/react'
import Price from '../components/Price'

describe('Price Component', () => {
  it('should render price with euro symbol', () => {
    render(<Price price={29.99} />)

    const priceElement = screen.getByText('29.99€')
    expect(priceElement).toBeTruthy()
  })

  it('should render integer prices correctly', () => {
    render(<Price price={25} />)

    const priceElement = screen.getByText('25€')
    expect(priceElement).toBeTruthy()
  })

  it('should render zero price', () => {
    render(<Price price={0} />)

    const priceElement = screen.getByText('0€')
    expect(priceElement).toBeTruthy()
  })

  it('should render negative prices', () => {
    render(<Price price={-10.5} />)

    const priceElement = screen.getByText('-10.5€')
    expect(priceElement).toBeTruthy()
  })

  it('should render decimal prices with multiple decimal places', () => {
    render(<Price price={19.999} />)

    const priceElement = screen.getByText('19.999€')
    expect(priceElement).toBeTruthy()
  })
})
