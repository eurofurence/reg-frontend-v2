/** @jsxImportSource @emotion/react */

import styled from '@emotion/styled'

type AlignMethod = 'left' | 'right'

const alignText = (method: AlignMethod, length: number, padChar: string, text: string) => {
  switch (method) {
    case 'left':
      return text.padEnd(length, padChar)
    case 'right':
      return text.padStart(length, padChar)
  }
}

const Caption = styled.h1`
	display: block;
	margin-bottom: 0.75em;

	font-family: Inter;
	font-weight: 700;
	font-size: 0.8rem;
	line-height: 1.21;
	letter-spacing: 0.02em;
	text-transform: uppercase;
	color: var(--color-grays-300)
`

const Content = styled.div`
	color: var(--color-grays-000);

	font-weight: 700;
	font-size: 2.4rem;
	line-height: 1.17;
	letter-spacing: 0.01em;
`

export interface DisplayProps {
  readonly content: string
  readonly caption?: string
  readonly size?: number
  readonly padding?: string
  readonly align?: AlignMethod
}

const Display = ({ content, caption, size, padding = ' ', align = 'right' }: DisplayProps) => {
  const justifiedContent =
    size === undefined ? content : alignText(align, size, padding, content.slice(0, size))

  return (
    <section>
      {caption != null ? <Caption>{caption}</Caption> : null}
      <Content>{justifiedContent}</Content>
    </section>
  )
}

export default Display
