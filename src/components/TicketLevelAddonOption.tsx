import TicketLevelSelectAddonOption from './TicketLevelSelectAddonOption'

export interface TicketLevelAddonOptionProps {
  readonly addonId: string
  readonly optionId: string
  readonly type: 'select'
  readonly items: readonly string[]
  readonly selected: boolean
  readonly preventChange?: boolean
  readonly value?: string
  readonly onChange?: (value: string | undefined) => void
  readonly error?: string
  readonly required?: boolean
}

const TicketLevelAddonOption = (props: TicketLevelAddonOptionProps) => {
  switch (props.type) {
    case 'select':
      return <TicketLevelSelectAddonOption {...props} />
    default:
      return <div>Not implemented!</div>
  }
}

export default TicketLevelAddonOption
