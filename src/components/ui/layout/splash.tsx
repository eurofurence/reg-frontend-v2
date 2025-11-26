import styled from '@emotion/styled'
import type { ReactElement, ReactNode } from 'react'
import type { DeepReadonly } from 'ts-essentials'

import { desktop, phone } from '../media-queries'

export interface SplashProps {
  readonly image: DeepReadonly<ReactElement>
  readonly children: DeepReadonly<ReactNode>
}

const Container = styled.main`
	display: grid;
	gap: 24px;
	align-items: center;

	padding: 3em 0em;

	@media not all and ${desktop} {
		margin: 0em 1.5em;
	}

	@media ${desktop} {
		width: 1075px;
		margin: 0em auto;
	}

	@media ${phone} {
		grid: auto-flow / 1fr;
	}

	@media not all and ${phone} {
		grid: auto-flow / repeat(14, 1fr);
	}
`

const Image = styled.figure`
	width: 100%;

	@media not all and ${phone} {
		grid-column: 1 / span 7;
	}
`

const Content = styled.article`
	h1 {
		color: var(--color-brand-2-400);

		&:not(:first-of-type) {
			margin-top: 1em;
		}

		&:not(:last-child) {
			margin-bottom: 1em;
		}
	}

	h2 {
		&:not(:first-of-type) {
			margin-top: 0.66666667em;
		}

		&:not(:last-child) {
			margin-bottom: 0.66666667em;
		}
	}

	@media not all and ${phone} {
		grid-column: 9 / span 6;
	}
`

const Splash = ({ image, children }: SplashProps) => (
  <Container>
    <Image>{image}</Image>
    <Content>{children}</Content>
  </Container>
)

export default Splash
