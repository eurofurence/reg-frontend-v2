import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { registrationCountdownCheck } from '~/apis/attsrv'
import config from '~/config'

export const eurofurenceDatesQueryKey = ['eurofurence', 'dates'] as const

/**
 * Parsed dates with DateTime objects
 */
export interface ParsedEurofurenceDates {
  registrationLaunch: DateTime
  registrationExpiration: DateTime
  conventionStart: DateTime
  conventionEnd: DateTime
}

/**
 * Fallback dates from config
 */
const fallbackDates: ParsedEurofurenceDates = {
  registrationLaunch: config.registrationLaunch,
  registrationExpiration: config.registrationExpirationDate,
  conventionStart: config.eventStartDate,
  conventionEnd: config.eventEndDate,
}

/**
 * Hook to fetch and use Eurofurence dates from the countdown API
 * Uses targetTime as registrationLaunch, falls back to config dates for others
 */
export const useEurofurenceDates = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: eurofurenceDatesQueryKey,
    queryFn: async (): Promise<ParsedEurofurenceDates> => {
      try {
        const countdown = await registrationCountdownCheck()
        return {
          ...fallbackDates,
          registrationLaunch: DateTime.fromISO(countdown.targetTime, { zone: 'utc' }),
        }
      } catch {
        // If countdown API fails, use all fallback dates
        return fallbackDates
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour - dates don't change frequently
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: 1000,
    // Use fallback dates as initial data
    initialData: fallbackDates,
    // Use fallback dates if query fails
    placeholderData: fallbackDates,
  })

  return {
    dates: data ?? fallbackDates,
    isLoading,
    error,
  }
}
