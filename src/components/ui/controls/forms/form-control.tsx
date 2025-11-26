import { css } from '@emotion/react'

import { COLUMN_COUNT } from '../../layout/form'
import { phone } from '../../media-queries'

export default ({ gridSpan = COLUMN_COUNT }: { readonly gridSpan?: number }) => css`
	@media not all and ${phone} {
		form > & {
			grid-column: span ${gridSpan};
		}
	}
`
