import styled from '@emotion/styled'
import type { ReactNode } from 'react'

import type { DeepReadonly } from 'ts-essentials'

const Container = styled.div`
	display: block;
	width: 1075px;
	margin: 0px auto;
`

const Background = styled.footer`
	background-color: var(--color-brand-3-100);
	color: var(--color-brand-2-500);
	min-height: 100px;
	display: flex;
	align-items: center;
	padding: 3em 2.7em;

	font-weight: 400;
	font-size: 1.4rem;
	line-height: 1.172;
`

const Footer = ({ children }: { readonly children?: DeepReadonly<ReactNode> }) => (
  <Background>
    <Container>{children}</Container>
  </Background>
)

export default Footer
