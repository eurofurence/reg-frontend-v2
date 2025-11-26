import styled from '@emotion/styled'

type Props = { readonly variant?: 'default' | 'inverted' | 'inverted-card' }

const background = ({ variant = 'default' }: Props) => {
  switch (variant) {
    case 'default':
      return 'var(--color-semantic-info)'
    case 'inverted':
      return 'var(--color-grays-000)'
    case 'inverted-card':
      return 'var(--color-grays-000)'
  }
}

const foreground = ({ variant = 'default' }: Props) => {
  switch (variant) {
    case 'default':
      return 'var(--color-grays-000)'
    case 'inverted':
      return 'var(--color-semantic-info)'
    case 'inverted-card':
      return 'var(--color-brand-2-500)'
  }
}

export default styled.button<Props>`
	background-color: ${background};

	height: 3em;
	padding: 0em 2.125em;

	border-radius: 3px;

	font-family: Roboto;
	font-size: 1.6rem;
	font-style: normal;
	font-weight: 700;
	line-height: 1.1875;

	color: ${foreground};

	display: flex;
	align-items: center;
	justify-content: center;

	cursor: pointer;
`
