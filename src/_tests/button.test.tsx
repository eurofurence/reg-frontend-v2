import { describe, expect, it } from 'bun:test'
import { render, screen } from '@testing-library/react'
import Button from '../components/ui/controls/button'

describe('Button Component', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeTruthy()
    expect(button.textContent).toBe('Click me')
  })

  it('should render with inverted variant', () => {
    render(<Button variant="inverted">Cancel</Button>)

    const button = screen.getByRole('button', { name: /cancel/i })
    expect(button).toBeTruthy()
    expect(button.textContent).toBe('Cancel')
  })

  it('should render with inverted-card variant', () => {
    render(<Button variant="inverted-card">Select</Button>)

    const button = screen.getByRole('button', { name: /select/i })
    expect(button).toBeTruthy()
    expect(button.textContent).toBe('Select')
  })

  it('should handle click events', () => {
    let clicked = false
    const handleClick = () => {
      clicked = true
    }

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    button.click()

    expect(clicked).toBe(true)
  })

  it('should accept additional props', () => {
    render(
      <Button type="submit" data-testid="submit-btn">
        Submit
      </Button>,
    )

    const button = screen.getByTestId('submit-btn')
    expect(button.getAttribute('type')).toBe('submit')
  })
})
