import { useMemo } from 'react'
import { useTranslations } from '~/localization'
import { Select } from './ui'

export interface TicketLevelSelectAddonOptionProps {
  readonly addonId: string
  readonly optionId: string
  readonly items: readonly string[]
  readonly selected: boolean
  readonly preventChange?: boolean
  readonly value?: string
  readonly onChange?: (value: string | undefined) => void
  readonly disabled?: boolean
  readonly error?: string
}

const TicketLevelSelectAddonOption = ({
  addonId,
  optionId,
  items,
  selected: _selected,
  preventChange = false,
  value,
  onChange,
  error,
}: TicketLevelSelectAddonOptionProps) => {
  // Note: selected parameter is used for conditional rendering in parent component
  const t = useTranslations()

  // Simple mapping for benefactor count values
  const getBenefactorCountLabel = (itemValue: string): string => {
    const countMap: Record<string, string> = {
      c1: '1x',
      c2: '2x',
      c3: '3x',
      c4: '4x',
      c5: '5x',
      c6: '6x',
      c8: '8x',
      c10: '10x',
      c15: '15x',
      c20: '20x',
      c30: '30x',
      c40: '40x',
      c50: '50x',
      c100: '100x',
    }
    return countMap[itemValue] || itemValue
  }

  // Simple mapping for t-shirt sizes
  const getTshirtSizeLabel = (itemValue: string): string => {
    const sizeMap: Record<string, string> = {
      XS: 'X-Small (Regular Cut)',
      wXS: 'X-Small (Ladies Cut)',
      S: 'Small (Regular Cut)',
      wS: 'Small (Ladies Cut)',
      M: 'Medium (Regular Cut)',
      wM: 'Medium (Ladies Cut)',
      L: 'Large (Regular Cut)',
      wL: 'Large (Ladies Cut)',
      XL: 'X-Large (Regular Cut)',
      wXL: 'X-Large (Ladies Cut)',
      XXL: 'XX-Large (Regular Cut)',
      wXXL: 'XX-Large (Ladies Cut)',
      m3XL: '3X-Large (Regular Cut)',
      w3XL: '3X-Large (Ladies Cut)',
      m4XL: '4X-Large (Regular Cut)',
      w4XL: '4X-Large (Ladies Cut)',
    }
    return sizeMap[itemValue] || itemValue
  }

  const { selectOptions } = useMemo(() => {
    const selectOptions = items.map((itemValue) => {
      let label: string

      if (addonId === 'benefactor' && optionId === 'count') {
        label = getBenefactorCountLabel(itemValue)
      } else if (addonId === 'tshirt' && optionId === 'size') {
        label = getTshirtSizeLabel(itemValue)
      } else {
        // Fallback to translation if available
        try {
          label = t(`register-ticket-level-addons-item-${addonId}-option-${optionId}-value`, {
            value: itemValue,
          })
        } catch {
          label = itemValue
        }
      }

      return {
        value: itemValue,
        label,
      }
    })

    return { selectOptions }
  }, [t, addonId, optionId, items])

  const selectedOption = selectOptions.find((option) => option.value === value)

  return (
    <Select
      label={t(`register-ticket-level-addons-item-${addonId}-option-${optionId}.label`)}
      isSearchable={false}
      options={selectOptions}
      value={selectedOption}
      error={error}
      onChange={(option) => {
        if (!preventChange) {
          onChange?.(option?.value)
        }
      }}
    />
  )
}

export default TicketLevelSelectAddonOption
