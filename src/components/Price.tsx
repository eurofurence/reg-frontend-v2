import styled from '@emotion/styled'

const Container = styled.section`
  color: var(--color-brand-2-900);
  font-family: Roboto;
  font-weight: 700;
  font-size: 2.4rem;

  label[data-checked] & {
    color: var(--color-semantic-info);
  }
`

interface PriceProps {
  readonly price: number
}

const Price = ({ price }: PriceProps) => <Container>{price}€</Container>

export default Price
