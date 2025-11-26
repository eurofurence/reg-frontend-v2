import { describe, expect, it } from 'bun:test'
import { render, screen } from '@testing-library/react'
import Card from '../components/ui/surfaces/card'

describe('Card Component', () => {
  it('should render as article element', () => {
    render(<Card data-testid="card-test">Test content</Card>)

    const card = screen.getByTestId('card-test')
    expect(card).toBeTruthy()
    expect(card.tagName).toBe('ARTICLE')
  })

  it('should render children content', () => {
    render(
      <Card data-testid="card-children">
        <h1>Card Title</h1>
        <p>Card content</p>
      </Card>,
    )

    const card = screen.getByTestId('card-children')
    expect(card.textContent).toContain('Card Title')
    expect(card.textContent).toContain('Card content')
  })

  it('should accept layout prop', () => {
    render(
      <Card layout="side-by-side" data-testid="card-layout">
        Content
      </Card>,
    )

    const card = screen.getByTestId('card-layout')
    expect(card).toBeTruthy()
    expect(card.tagName).toBe('ARTICLE')
  })

  it('should accept inverted prop', () => {
    render(
      <Card inverted data-testid="card-inverted">
        Content
      </Card>,
    )

    const card = screen.getByTestId('card-inverted')
    expect(card).toBeTruthy()
    expect(card.tagName).toBe('ARTICLE')
  })

  it('should accept custom width and height', () => {
    render(
      <Card width="300px" height="200px" data-testid="card-sized">
        Content
      </Card>,
    )

    const card = screen.getByTestId('card-sized')
    expect(card).toBeTruthy()
    expect(card.tagName).toBe('ARTICLE')
  })

  it('should handle header, content, and footer sections in column layout', () => {
    render(
      <Card data-testid="card-sections">
        <header>
          <h1>Title</h1>
        </header>
        <p>Main content</p>
        <footer>
          <button>Action</button>
        </footer>
      </Card>,
    )

    const card = screen.getByTestId('card-sections')
    expect(card.textContent).toContain('Title')
    expect(card.textContent).toContain('Main content')
    expect(card.textContent).toContain('Action')
    expect(card.tagName).toBe('ARTICLE')
  })

  it('should handle header, content, and footer sections in side-by-side layout', () => {
    render(
      <Card layout="side-by-side" data-testid="card-sidebyside">
        <header>
          <h1>Title</h1>
        </header>
        <p>Main content</p>
        <footer>
          <button>Action</button>
        </footer>
        <figure>
          <img src="test.jpg" alt="Test" />
        </figure>
      </Card>,
    )

    const card = screen.getByTestId('card-sidebyside')
    expect(card.textContent).toContain('Title')
    expect(card.textContent).toContain('Main content')
    expect(card.textContent).toContain('Action')
    expect(card.tagName).toBe('ARTICLE')
  })

  it('should render with default props', () => {
    render(<Card data-testid="card-default">Content</Card>)

    const card = screen.getByTestId('card-default')
    expect(card.tagName).toBe('ARTICLE')
    expect(card.textContent).toContain('Content')
  })
})
