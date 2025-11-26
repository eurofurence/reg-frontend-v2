import styled from '@emotion/styled'

import { desktop } from '../media-queries'

export default styled.main`
	display: block;
	padding: 3em 0em;

	@media not all and ${desktop} {
		margin: 0em 2.4rem;
	}

	@media ${desktop} {
		width: 1075px;
		margin: 0em auto;
	}
`
