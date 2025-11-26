import styled from '@emotion/styled'
import type { FC, ReactNode } from 'react'
import { forwardRef } from 'react'
import type { DeepReadonly } from 'ts-essentials'

import formControlStyle from './form-control'

const FormLabel = styled.label`
	display: grid;
	grid: auto-flow / min-content auto;
	column-gap: 0.5em;
	align-items: center;

	${formControlStyle}

	fieldset > &:not(:last-of-type) {
		margin-bottom: 0.5em;
	}

	fieldset > &:not(:first-of-type) {
		margin-top: 0.5em;
	}

	& > input:first-of-type {
		grid-column: 1;
	}

	& > * {
		grid-column: 2;
	}
`

export default FormLabel

export type WithFormLabelProps<P> =
  | P
  | (P & {
      readonly label?: string
      readonly children?: DeepReadonly<ReactNode>
      readonly gridSpan?: number
    })

export const withFormLabel = <T, P extends object>(ChildComponent: FC<P>) =>
  forwardRef<T, WithFormLabelProps<P>>((props, ref) => {
    if ('label' in props || 'children' in props) {
      const { label, gridSpan, children, ...rest } = props

      return (
        <FormLabel gridSpan={gridSpan}>
          <ChildComponent {...(rest as P)} ref={ref} />
          {label}
          {children}
        </FormLabel>
      )
    } else {
      const { ref: _, ...restProps } = props as P & { ref?: unknown }

      return <ChildComponent {...(restProps as P)} ref={ref} />
    }
  })
