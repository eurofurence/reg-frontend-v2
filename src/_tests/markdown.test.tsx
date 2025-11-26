import { describe, expect, it } from 'bun:test'
import { render, screen } from '@testing-library/react'
import Markdown from '../components/Markdown'

describe('Markdown Component', () => {
  it('should render plain text without markdown', () => {
    render(<Markdown>Hello world</Markdown>)

    expect(screen.getByText('Hello world')).toBeTruthy()
  })

  it('should render nothing for empty string', () => {
    const { container } = render(<Markdown>{''}</Markdown>)

    expect(container.firstChild).toBeNull()
  })

  it('should render paragraphs separated by double newlines', () => {
    render(<Markdown>{'First paragraph\n\nSecond paragraph'}</Markdown>)

    const paragraphs = screen.getAllByText(/paragraph/)
    expect(paragraphs).toHaveLength(2)
  })

  it('should convert single newlines to line breaks', () => {
    render(<Markdown>{'Line one\nLine two'}</Markdown>)

    const container = screen.getByText('Line one').closest('p')
    expect(container).toBeTruthy()
    expect(container?.querySelector('br')).toBeTruthy()
  })

  it('should render unordered lists from + prefixed items', () => {
    render(<Markdown>{'+ Item one\n+ Item two\n+ Item three'}</Markdown>)

    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toBe('Item one')
    expect(items[1].textContent).toBe('Item two')
    expect(items[2].textContent).toBe('Item three')
  })

  it('should render markdown links as anchor tags', () => {
    render(<Markdown>{'Check out [this link](https://example.com)'}</Markdown>)

    const link = screen.getByRole('link', { name: 'this link' })
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noreferrer noopener')
  })

  it('should render multiple links in the same text', () => {
    render(
      <Markdown>{'[Link 1](https://example1.com) and [Link 2](https://example2.com)'}</Markdown>,
    )

    const link1 = screen.getByRole('link', { name: 'Link 1' })
    const link2 = screen.getByRole('link', { name: 'Link 2' })

    expect(link1.getAttribute('href')).toBe('https://example1.com')
    expect(link2.getAttribute('href')).toBe('https://example2.com')
  })

  it('should render HTML span tags with className', () => {
    render(<Markdown>{'Some <span className="highlight">highlighted</span> text'}</Markdown>)

    const span = screen.getByText('highlighted')
    expect(span.tagName).toBe('SPAN')
    expect(span.className).toBe('highlight')
  })

  it('should handle mixed content (paragraphs, lists, links)', () => {
    render(
      <Markdown>
        {
          'Introduction text\n\n+ List item 1\n+ List item 2\n\nConclusion with [link](https://example.com)'
        }
      </Markdown>,
    )

    // Check for paragraph
    expect(screen.getByText('Introduction text')).toBeTruthy()

    // Check for list
    const list = screen.getByRole('list')
    expect(list).toBeTruthy()

    // Check for link
    const link = screen.getByRole('link', { name: 'link' })
    expect(link.getAttribute('href')).toBe('https://example.com')
  })

  it('should apply className prop to container', () => {
    render(<Markdown className="custom-class">Test content</Markdown>)

    const container = screen.getByText('Test content').closest('div')
    expect(container?.className).toBe('custom-class')
  })

  it('should handle empty list items gracefully', () => {
    render(<Markdown>{'+\n+ Valid item'}</Markdown>)

    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThan(0) // Should have at least one valid item
    // Find the valid item (should contain 'Valid item')
    const validItem = items.find((item) => item.textContent?.includes('Valid item'))
    expect(validItem).toBeTruthy()
    expect(validItem?.textContent).toBe('Valid item')
  })
})
