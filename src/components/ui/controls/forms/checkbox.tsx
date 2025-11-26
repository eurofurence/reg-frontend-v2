/** @jsxImportSource @emotion/react */

import styled from '@emotion/styled'
import { type ChangeEventHandler, forwardRef } from 'react'

import { type WithFormLabelProps, withFormLabel } from './form-label'

const Input = styled.input`
	width: 1.125em;
	height: 1.125em;
	border: 2px solid var(--color-grays-300);
	border-radius: 0.1em;

	&:checked {
		background-color: var(--color-semantic-info);
		border-color: var(--color-semantic-info);
	}
`

interface PlainCheckboxProps {
  readonly name: string
  readonly checked?: boolean
  readonly defaultChecked?: boolean
  readonly onChange?: ChangeEventHandler<HTMLInputElement>
  readonly readOnly?: boolean
  readonly disabled?: boolean
}

export type CheckboxProps = WithFormLabelProps<PlainCheckboxProps>

const Checkbox = withFormLabel<HTMLInputElement, PlainCheckboxProps>(
  forwardRef<HTMLInputElement, PlainCheckboxProps>((props, ref) => (
    <Input {...props} type="checkbox" ref={ref} />
  )),
)

export default Checkbox
