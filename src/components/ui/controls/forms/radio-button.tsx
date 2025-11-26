/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import styled from '@emotion/styled'
import {
  type ChangeEventHandler,
  createContext,
  Fragment,
  forwardRef,
  type ReactNode,
  useContext,
} from 'react'

import type { DeepReadonly } from 'ts-essentials'

import FieldSet from './field-set'
import { type WithFormLabelProps, withFormLabel } from './form-label'

const NameContext = createContext<{
  readonly name: string
  readonly invalid: boolean
}>({ name: 'unknown', invalid: false })

const Input = styled.input<{ readonly invalid: boolean }>`
	// TODO: Probably scale padding and border along.

	width: 1.25em;
	height: 1.25em;
	border: 2px solid var(--color-grays-300);
	border-radius: 0.625em;

	&:checked {
		background-color: var(--color-semantic-info);
		border-color: var(--color-semantic-info);
		background-clip: content-box;
		padding: 3px;
	}

	${({ invalid = false }) =>
    !invalid
      ? css``
      : css`
		border-color: var(--color-semantic-error);
	`}

	&:invalid {
		border-color: var(--color-semantic-error);
	}
`

interface PlainRadioItemProps {
  readonly value: string
  readonly checked?: boolean
  readonly defaultChecked?: boolean
  readonly onChange?: ChangeEventHandler<HTMLInputElement>
  readonly readOnly?: boolean
}

export type RadioItemProps = WithFormLabelProps<PlainRadioItemProps>

export const RadioItem = withFormLabel<HTMLInputElement, PlainRadioItemProps>(
  forwardRef<HTMLInputElement, PlainRadioItemProps>((props, ref) => {
    const { name, invalid } = useContext(NameContext)

    return <Input {...props} name={name} type="radio" invalid={invalid} ref={ref} />
  }),
)

export interface RadioGroupProps {
  readonly name: string
  readonly invalid?: boolean
  readonly children: DeepReadonly<ReactNode>
}

export const RadioGroup = ({ name, invalid = false, children }: RadioGroupProps) => (
  <Fragment>
    <NameContext.Provider value={{ name, invalid }}>{children}</NameContext.Provider>
  </Fragment>
)

export interface RadioSetProps {
  readonly name: string
  readonly gridSpan?: number
  readonly legend: string
  readonly error?: string
  readonly children: DeepReadonly<ReactNode>
}

export const RadioSet = ({ name, gridSpan, legend, error, children }: RadioSetProps) => (
  <FieldSet legend={legend} gridSpan={gridSpan} error={error}>
    <RadioGroup name={name} invalid={Boolean(error)}>
      {children}
    </RadioGroup>
  </FieldSet>
)

RadioGroup.Item = RadioItem
RadioSet.Item = RadioItem

export default RadioGroup
