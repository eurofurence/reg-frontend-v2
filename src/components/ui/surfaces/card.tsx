import { css } from '@emotion/react'
import styled from '@emotion/styled'

export type CardLayout = 'column' | 'side-by-side'

export interface CardProps {
  readonly width?: string
  readonly height?: string
  readonly inverted?: boolean
  readonly layout?: CardLayout
}

const layoutStyle = ({ layout = 'column', inverted = false }: CardProps) => {
  switch (layout) {
    case 'column':
      return css`
				display: flex;
				flex-direction: column;
				padding: 2em;

				> * {
					flex: 1;

					&:not(:first-of-type) {
						padding-top: 2.2rem;
						border-top: solid 1px ${inverted ? 'var(--color-brand-2-100)' : 'var(--color-grays-300)'};
					}

					&:not(:last-child) {
						padding-bottom: 2.2rem;
					}
				}

				> header {
					flex: none;
				}

				> footer {
					flex: none;
				}
			`
    case 'side-by-side':
      return css`
				display: grid;
				grid-template-columns: repeat(14, 1fr);
				grid-template-rows: repeat(3, min-content);
				column-gap: 24px;
				padding: 4em;

				> * {
					grid-column: 1 / 9;
					grid-row: 2;
				}

				> header {
					grid-column: 1 / 7;
					grid-row: 1;

					margin-bottom: 1em;
				}

				> footer {
					grid-column: 1 / 7;
					grid-row: 3;

					border-top: solid 1px #E5E5E5;
					margin-top: 2em;
					padding-top: 1em;
				}

				> figure {
					grid-column: 9 / 15;
					grid-row: 1 / 4;
					justify-self: center;
					align-self: center;
				}
			`
  }
}

export default styled.article<CardProps>`
	${layoutStyle}

	background-color: ${({ inverted = false }) => (inverted ? 'var(--color-brand-2-500)' : 'var(--color-grays-000)')};
	color: ${({ inverted = false }) => (inverted ? 'var(--color-grays-000)' : 'var(--color-grays-500)')};
	border: ${({ inverted = false }) => (inverted ? 'unset' : 'solid 2px var(--color-grays-300)')};
	border-radius: 1rem;

	${({ inverted = false }) =>
    !inverted
      ? css``
      : css`
		h1 {
			color: unset;
		}

		a {
			color: unset;
		}
	`}

	${({ width = 'unset' }) => ({ width })}
	${({ height = 'unset' }) => ({ height })}

	font-family: Inter;
	font-weight: 400;
	font-size: 1.6rem;
	line-height: 1.5;

	> header {
		> h1 {
			font-family: Manrope;
			font-weight: 500;
			font-size: 1.25em;
			line-height: 1.5;
		}
	}
`
