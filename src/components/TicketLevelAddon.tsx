import { useEffect } from 'react'
import config from '~/config'
import { useTranslations } from '~/localization'
import TicketLevelAddonControl from './TicketLevelAddonControl'
import TicketLevelAddonOption from './TicketLevelAddonOption'

export interface TicketLevelAddonProps {
  readonly addonId: keyof typeof config.addons
  readonly selectedLevel: string | null
  readonly ticketType: 'full' | 'day'
  readonly selectedAddons: Record<string, { selected?: boolean; options?: Record<string, string> }>
  readonly onAddonChange: (addonId: keyof typeof config.addons, selected: boolean) => void
  readonly onAddonOptionChange: (
    addonId: keyof typeof config.addons,
    optionId: string,
    value: string | undefined,
  ) => void
  readonly errors?: Record<string, any>
}

const TicketLevelAddon = ({
  addonId,
  selectedLevel,
  ticketType,
  selectedAddons,
  onAddonChange,
  onAddonOptionChange,
  errors,
}: TicketLevelAddonProps) => {
  const t = useTranslations()
  const addon = config.addons[addonId]

  const isIncluded =
    selectedLevel !== null &&
    (config.ticketLevels[selectedLevel as keyof typeof config.ticketLevels]?.includes?.includes(
      addonId,
    ) ??
      false)
  const isRequired =
    selectedLevel !== null &&
    (config.ticketLevels[selectedLevel as keyof typeof config.ticketLevels]?.requires?.includes(
      addonId,
    ) ??
      false)
  const isUnavailable = addon.unavailable ?? false

  const addonState = selectedAddons[addonId]
  const isSelected = addonState?.selected ?? addon.default

  // Check requirements
  const requirementsMet = () => {
    if (addon.requires && addon.requires.length > 0) {
      const missingRequirements = addon.requires.filter((reqId) => !selectedAddons[reqId]?.selected)
      return missingRequirements.length === 0
    }
    return true
  }

  const shouldShowAddon = () => {
    // Don't show hidden addons
    if (addon.hidden) return false

    // Don't show if unavailable for this ticket type
    if (addon.unavailableFor?.type?.includes(ticketType)) return false

    // Don't show if unavailable for this level
    if (addon.unavailableFor?.level?.includes(selectedLevel as keyof typeof config.ticketLevels))
      return false

    // Check requirements
    if (!requirementsMet()) return false

    // Show if unavailable but already selected (previously bought)
    if (isUnavailable && !isSelected) return false

    return true
  }

  useEffect(() => {
    // Auto-select required addons
    if (isRequired && !isSelected) {
      onAddonChange(addonId, true)
    }

    // Auto-deselect if requirements not met
    if (!requirementsMet() && isSelected && !isRequired) {
      onAddonChange(addonId, false)
    }
  }, [selectedLevel, selectedAddons])

  if (!shouldShowAddon()) return null

  const effectivePrice = isIncluded ? 0 : addon.price
  const isDisabled = isIncluded || isRequired || isUnavailable

  return (
    <TicketLevelAddonControl
      label={t(`register-ticket-level-addons-item-${addonId}.label`)}
      description={t(`register-ticket-level-addons-item-${addonId}.description`)}
      price={effectivePrice}
      disabled={isDisabled}
      checked={isSelected}
      onChange={(e) => onAddonChange(addonId, e.target.checked)}
    >
      {Object.entries(addon.options).map(([optionId, optionConfig]) => {
        const isRequired =
          isSelected &&
          ((addonId === 'tshirt' && optionId === 'size') ||
            (addonId === 'benefactor' && optionId === 'count'))
        const fieldError = errors?.addons?.[addonId]?.options?.[optionId]?.message

        return (
          <TicketLevelAddonOption
            key={optionId}
            addonId={addonId}
            optionId={optionId}
            type={optionConfig.type}
            items={optionConfig.items}
            selected={isSelected}
            value={addonState?.options?.[optionId]}
            onChange={(value) => onAddonOptionChange(addonId, optionId, value)}
            preventChange={isUnavailable && optionId === 'count'}
            error={fieldError}
            required={isRequired}
          />
        )
      })}
    </TicketLevelAddonControl>
  )
}

export default TicketLevelAddon
