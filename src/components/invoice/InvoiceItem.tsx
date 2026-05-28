/*
 * An item on the invoice.
 * The `extra` property can be used to add additional information below the item's name.
 */

import styled from '@emotion/styled'

const Container = styled.li`
	display: grid;
	grid-template: "label price" auto
	               "extra extra"  auto / auto auto;
	align-items: center;

	:not(:first-of-type) {
		margin-top: 1.5em;
	}

	:not(:last-child) {
		margin-bottom: 1.5em;
	}
`

const Label = styled.div`
	grid-area: label;
`

const Price = styled.div`
	grid-area: price;
	text-align: right;
`

const Extra = styled.div`
	grid-area: extra;

	color: var(--color-brand-2-100);

	font-size: 1.4rem;
`

export interface InvoiceItemProps {
  readonly amount: number
  readonly name: string
  readonly price: number
  readonly extra?: string
  readonly url?: string
  readonly linktext?: string
}

const InvoiceItem = ({ amount, name, price, extra, url, linktext }: InvoiceItemProps) => (
  <Container>
    {url ? (
      <Label>
        {amount} x {name} (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {linktext}
        </a>
        )
      </Label>
    ) : (
      <Label>
        {amount} x {name}
      </Label>
    )}
    <Price>{price} €</Price>
    {extra === undefined ? undefined : <Extra>{extra}</Extra>}
  </Container>
)

export default InvoiceItem
