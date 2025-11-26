import styled from '@emotion/styled'
import type { ReactNode } from 'react'
import { forwardRef } from 'react'
import Markdown from './Markdown'
import Price from './Price'
import { Checkbox } from './ui'

export type TicketLevelAddonControlProps = {
  readonly label: string
  readonly description: string
  readonly children?: ReactNode
  readonly price: number
  readonly disabled?: boolean
  readonly name?: string
  readonly checked?: boolean
  readonly onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const Container = styled.section`
  display: grid;
  grid: "label price" auto
        "description options" auto
        / fit-content(60rem) auto;
  gap: 1.6rem;

  &:not(:first-of-type) {
    margin-top: 6.4rem;
  }

  &:not(:last-child) {
    margin-bottom: 6.4rem;
  }
`

const CheckboxContainer = styled.section`
  grid-area: label;
  font-size: 2rem;
`

const Description = styled.section`
  grid-area: description;
`

const PriceContainer = styled.section`
  grid-area: price;
  justify-self: end;
`

const OptionsContainer = styled.div`
  grid-area: options;
  justify-self: end;
  width: 25rem;
  font-family: Manrope;
`

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const TicketLevelAddonControl = forwardRef<HTMLInputElement, TicketLevelAddonControlProps>(
  ({ children, price, description, label, disabled, name, checked, onChange }, ref) => (
    <Container>
      <CheckboxContainer>
        <Checkbox
          ref={ref}
          label={label}
          disabled={disabled}
          name={name || ''}
          checked={checked}
          onChange={onChange}
        />
      </CheckboxContainer>
      <Description>
        <Markdown>{description}</Markdown>
      </Description>
      <PriceContainer>
        <Price price={price} />
      </PriceContainer>
      <OptionsContainer>{children}</OptionsContainer>
    </Container>
  ),
)

export default TicketLevelAddonControl
