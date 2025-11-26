/*
 * An item on the invoice.
 * The `extra` property can be used to add additional information below the item's name.
 */

import { css } from '@emotion/react'
import styled from '@emotion/styled'

const Container = styled.li<{ readonly warn?: boolean }>`
	display: grid;
	grid-template: "label price" auto
	               "extra extra"  auto / auto auto;
	align-items: center;

	${({ warn = false }) =>
    !warn
      ? css``
      : css`
		color: var(--color-semantic-warning);
	`}

	:not(:first-of-type) {
		margin-top: 0.75em;
	}

	:not(:last-child) {
		margin-bottom: 0.75em;
	}
`

const Label = styled.div`
	grid-area: label;

	font-size: 1.8rem;
`

const Price = styled.div`
	grid-area: price;

	text-align: right;

	font-size: 2.0rem;
	font-weight: 700;
`

const Extra = styled.div`
	grid-area: extra;

	color: var(--color-brand-2-100);

	font-size: 1.4rem;
`

export interface InvoiceTotalItemProps {
  readonly type: 'price' | 'due'
  readonly name: string
  readonly value: number
  readonly extra?: string
  readonly warn?: boolean
}

const InvoiceTotalItem = ({ name, value, extra, warn }: InvoiceTotalItemProps) => (
  <Container warn={warn}>
    <Label>{name}</Label>
    <Price>{value} €</Price>
    {extra === undefined ? undefined : <Extra>{extra}</Extra>}
  </Container>
)

export default InvoiceTotalItem
