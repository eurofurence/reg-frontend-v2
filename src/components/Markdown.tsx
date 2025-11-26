import type { ReactNode } from 'react'

interface MarkdownProps {
  children: string
  className?: string
}

/**
 * Simple markdown renderer that handles:
 * - Line breaks (\n -> <br />)
 * - List items (+ item -> <li>item</li>)
 * - Markdown links [text](url) -> <a href="url">text</a>
 * - HTML tags (preserved as-is, currently supports <span className="...">)
 * - Tailwind CSS className support via className prop
 */
const Markdown = ({ children, className }: MarkdownProps) => {
  if (!children) {
    return null
  }

  // Split by paragraphs (double newlines) first
  const paragraphs = children.split('\n\n')

  return (
    <div className={className}>
      {paragraphs.map((paragraph, paragraphIndex) => {
        const lines = paragraph.split('\n')
        const hasListItems = lines.some((line) => line.trim().startsWith('+'))

        if (hasListItems) {
          // Render as unordered list
          const listItems = lines
            .filter((line) => line.trim())
            .map((line) =>
              line.trim().startsWith('+') ? line.trim().substring(1).trim() : line.trim(),
            )

          return (
            <ul key={`paragraph-${paragraphIndex}`}>
              {listItems.map((item, itemIndex) => (
                <li key={`item-${paragraphIndex}-${itemIndex}`}>
                  {processLine(item, paragraphIndex * 1000 + itemIndex)}
                </li>
              ))}
            </ul>
          )
        } else {
          // Render as regular paragraph
          return (
            <p key={`paragraph-${paragraphIndex}`}>
              {lines.map((line, lineIndex) => (
                <span key={`line-${paragraphIndex}-${lineIndex}`}>
                  {lineIndex > 0 && <br />}
                  {processLine(line, paragraphIndex * 1000 + lineIndex)}
                </span>
              ))}
            </p>
          )
        }
      })}
    </div>
  )
}

/**
 * Processes a single line for markdown links and HTML
 */
const processLine = (line: string, lineKey: number): ReactNode[] => {
  const parts: ReactNode[] = []
  const remaining = line
  let key = 0

  // Process markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null = linkRegex.exec(remaining)

  while (match !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const beforeLink = remaining.slice(lastIndex, match.index)
      if (beforeLink) {
        parts.push(...parseHtml(beforeLink, lineKey * 10000 + key))
        key += beforeLink.length
      }
    }

    // Add the link
    const linkText = match[1]
    const linkUrl = match[2]
    parts.push(
      <a
        key={`link-${lineKey * 10000 + key}`}
        href={linkUrl}
        target="_blank"
        rel="noreferrer noopener"
      >
        {linkText}
      </a>,
    )
    key += match[0].length

    lastIndex = match.index + match[0].length
    match = linkRegex.exec(remaining)
  }

  // Add remaining text after last link
  if (lastIndex < remaining.length) {
    const afterLink = remaining.slice(lastIndex)
    if (afterLink) {
      parts.push(...parseHtml(afterLink, lineKey * 10000 + key))
    }
  }

  // If no links found, just parse HTML
  if (parts.length === 0) {
    return parseHtml(line, lineKey * 10000)
  }

  return parts
}

/**
 * Parses HTML tags in text and returns React nodes
 * Currently handles: <span className="...">...</span>
 */
const parseHtml = (text: string, startKey: number): ReactNode[] => {
  const parts: ReactNode[] = []
  const remaining = text
  let key = startKey

  // Match HTML tags like <span className="important">text</span>
  const htmlTagRegex = /<(\w+)([^>]*)>(.*?)<\/\1>/g
  let lastIndex = 0
  let match: RegExpExecArray | null = htmlTagRegex.exec(remaining)

  while (match !== null) {
    // Add text before the HTML tag
    if (match.index > lastIndex) {
      const beforeTag = remaining.slice(lastIndex, match.index)
      if (beforeTag) {
        parts.push(beforeTag)
        key += beforeTag.length
      }
    }

    // Parse the HTML tag
    const tagName = match[1]
    const attributes = match[2]
    const content = match[3]

    // Parse className attribute
    const classNameMatch = attributes.match(/className="([^"]+)"/)
    const className = classNameMatch ? classNameMatch[1] : undefined

    // Create React element based on tag name
    if (tagName === 'span') {
      parts.push(
        <span key={`html-${key}`} className={className}>
          {content}
        </span>,
      )
    } else {
      // For other tags, just render the content
      parts.push(<span key={`html-${key}`}>{content}</span>)
    }

    key += match[0].length
    lastIndex = match.index + match[0].length
    match = htmlTagRegex.exec(remaining)
  }

  // Add remaining text after last HTML tag
  if (lastIndex < remaining.length) {
    const afterTag = remaining.slice(lastIndex)
    if (afterTag) {
      parts.push(afterTag)
    }
  }

  // If no HTML tags found, return text as-is
  if (parts.length === 0) {
    return [text]
  }

  return parts
}

export default Markdown
