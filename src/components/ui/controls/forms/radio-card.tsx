/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import styled from '@emotion/styled'
import {
  type ChangeEventHandler,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import type { DeepReadonly } from 'ts-essentials'

import Card, { type CardProps } from '../../surfaces/card'
import { RadioItem } from './radio-button'

export interface RadioCardProps extends CardProps {
  readonly label?: string
  readonly value: string
  readonly checked?: boolean
  readonly defaultChecked?: boolean
  readonly onChange?: ChangeEventHandler<HTMLInputElement>
  readonly readOnly?: boolean
  readonly children?: DeepReadonly<ReactNode>
}

const Header = styled.header`
	display: flex;
	align-items: center;
`

const Label = styled.h1`
	margin-left: 0.4em;
`

const CheckableCard = styled(Card)`
	cursor: pointer;
	user-select: none;

	&[data-checked] {
		border-color: var(--color-semantic-info);

		${({ layout = 'column' }) =>
      layout !== 'column'
        ? css``
        : css`
			> *:not(:first-of-type) {
				border-top-color: var(--color-semantic-info);
			}
		`}

		> header {
			color: var(--color-semantic-info);

			> h1 {
				color: var(--color-semantic-info);
			}
		}
	}
`

const RadioCard = forwardRef(
  (
    { label, children, checked, defaultChecked, height, width, layout, ...rest }: RadioCardProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const cardRef = useRef<HTMLLabelElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [inputChecked, setInputChecked] = useState(defaultChecked ?? false)
    const isUncontrolled = checked == null

    useImperativeHandle(ref, () => inputRef.current!)

    useEffect(() => {
      if (isUncontrolled) {
        cardRef
          .current!.closest('form')!
          .addEventListener('change', (e) => setInputChecked(e.target === inputRef.current!))
      }
    }, [isUncontrolled])

    /*
     * All this is to make the highlight of the Card follow the checked state of the input if it is uncontrolled.
     * This because at the moment the CSS `:has()` pseudoclass is not supported in any browser, so I can't do `:has(> input:checked)`.
     * The `data-checked` prop is to also provide depending CSS (such as items inside the card) the option to follow the checked state.
     *
     * i.e., if you want a contained item to have a semantic info border, you can do
     *
     *     ${RadioCard}[data-checked] {
     *         border-color: var(--color-semantic-info);
     *     }
     *
     * instead of
     *
     *     ${RadioCard}:has(> input:checked) {
     *         border-color: var(--color-semantic-info);
     *     }
     *
     * If anyone has a better idea, feel free to change this.
     */

    return (
      <CheckableCard
        as="label"
        {...((isUncontrolled ? inputChecked : checked) ? { 'data-checked': '' } : {})}
        width={width}
        height={height}
        layout={layout}
        ref={isUncontrolled ? cardRef : undefined}
      >
        <Header>
          <RadioItem
            {...rest}
            {...(isUncontrolled ? { defaultChecked } : { checked })}
            ref={inputRef}
          />
          <Label>{label}</Label>
        </Header>
        {children}
      </CheckableCard>
    )
  },
)

export default RadioCard
