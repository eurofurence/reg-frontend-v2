/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { type ChangeEventHandler, forwardRef } from 'react'

import {
  type WithFormHeaderLabelProps,
  type WithFormHeaderLabelWrappedComponentProps,
  withFormHeaderLabel,
} from './form-header-label'

const TArea = styled.textarea<{
  readonly height?: string
  readonly invalid?: boolean
}>`
	min-width: 100%;
	max-width: 100%;
	height: ${({ height }) => height ?? '6.25em'};
	border: 2px solid var(--color-grays-300);
	border-radius: 0.1875em;
	padding: 0.75em 1em 1em 1em;

	color: var(--color-grays-900);

	${({ invalid = false }) =>
    !invalid
      ? css``
      : css`
		border-color: var(--color-semantic-error);
	`}

	&::placeholder {
		color: var(--color-grays-300);
	}

	&:invalid {
		border-color: var(--color-semantic-error);
	}
`

interface PlainTextAreaProps {
  readonly name: string
  readonly height?: string
  readonly placeholder: string
  readonly value?: string
  readonly defaultValue?: string
  readonly onChange?: ChangeEventHandler<HTMLTextAreaElement>
  readonly readOnly?: boolean
}

export type TextAreaProps = WithFormHeaderLabelProps<PlainTextAreaProps>

const TextArea = withFormHeaderLabel<HTMLTextAreaElement, PlainTextAreaProps>(
  forwardRef<HTMLTextAreaElement, WithFormHeaderLabelWrappedComponentProps<PlainTextAreaProps>>(
    (props, ref) => <TArea {...props} ref={ref} />,
  ),
)

export default TextArea
