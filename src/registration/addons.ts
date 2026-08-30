import config from '~/config'
import type { TicketLevelAddons } from './types'

// Addon options carry no defaults in the config, so the per-addon option shapes
// only get filled in once the user picks them.
export const determineDefaultAddons = (ticketType: 'day' | 'full' | undefined): TicketLevelAddons =>
  Object.fromEntries(
    (Object.keys(config.addons) as (keyof typeof config.addons)[]).map((addonId) => {
      const addon = config.addons[addonId]
      const unavailableForType =
        ticketType !== undefined && (addon.unavailableFor?.type?.includes(ticketType) ?? false)

      return [addonId, { selected: addon.default && !unavailableForType, options: {} }]
    }),
  ) as TicketLevelAddons
