/** @jsxImportSource @emotion/react */

import styled from '@emotion/styled'
import type React from 'react'
import { forwardRef, type ReactNode } from 'react'

import type { DeepReadonly } from 'ts-essentials'

import ErrorMessage from './error-message'
import formControlStyle from './form-control'
import FormHeader from './form-header'

export interface FormHeaderLabelProps {
  readonly label: string
  readonly gridSpan?: number
  readonly children: DeepReadonly<ReactNode>
}

const Label = styled.label<{ readonly gridSpan?: number }>`
	${formControlStyle}
`

const FormHeaderLabel = ({ label, gridSpan, children }: FormHeaderLabelProps) => (
  <Label gridSpan={gridSpan}>
    <FormHeader>{label}</FormHeader>
    {children}
  </Label>
)

export default FormHeaderLabel

export type WithFormHeaderLabelWrappedComponentProps<P> = Omit<
  P,
  'label' | 'gridSpan' | 'error'
> & {
  readonly invalid?: boolean
}

export type WithFormHeaderLabelProps<P> = {
  readonly error?: string
} & (
  | P
  | (P & {
      readonly label: string
      readonly gridSpan?: number
    })
)

export const withFormHeaderLabel = <T, P>(
  ChildComponent: React.ForwardRefExoticComponent<
    WithFormHeaderLabelWrappedComponentProps<P> & React.RefAttributes<T>
  >,
) =>
  forwardRef<T, WithFormHeaderLabelProps<P>>((props, ref) => {
    if ('label' in props) {
      const { label, gridSpan, error, ...rest } = props

      return (
        <FormHeaderLabel label={label} gridSpan={gridSpan}>
          <ChildComponent
            {...({
              ...rest,
              invalid: Boolean(error),
              ref,
            } as any)}
          />
          {error === undefined ? undefined : <ErrorMessage>{error}</ErrorMessage>}
        </FormHeaderLabel>
      )
    } else {
      const { error, ...rest } = props

      return (
        <ChildComponent
          {...({
            ...rest,
            invalid: Boolean(error),
            ref,
          } as any)}
        />
      )
    }
  })
