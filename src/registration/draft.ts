import { useQueryClient } from '@tanstack/react-query'
import { deserializeRegistrationInfo } from './autosave'
import { type RegistrationQueryResult, registrationQueryKey } from './query'
import { isSubmitted, type RegistrationInfo } from './types'

export const useDraftRegistration = () => {
  const queryClient = useQueryClient()

  const saveDraftRegistration = (
    updater: (prev: Partial<RegistrationInfo>) => Partial<RegistrationInfo>,
  ) => {
    const cached = queryClient.getQueryData<RegistrationQueryResult>(registrationQueryKey)

    // Drafts only exist for new registrations, existing ones go through the update mutation.
    if (cached?.registration && isSubmitted(cached.registration)) {
      return
    }

    const previousInfo = deserializeRegistrationInfo(cached?.registration?.registrationInfo) ?? {}
    const nextInfo = updater(previousInfo)

    queryClient.setQueryData<RegistrationQueryResult>(registrationQueryKey, {
      isOpen: true,
      registration: {
        status: 'unsubmitted',
        registrationInfo: nextInfo,
      },
      lastSavedAt: new Date().toISOString(),
    })
  }

  const clearDraft = () => {
    queryClient.setQueryData<RegistrationQueryResult>(registrationQueryKey, (old) =>
      old
        ? {
            ...old,
            registration: {
              status: 'unsubmitted',
              registrationInfo: {},
            },
            lastSavedAt: undefined,
          }
        : old,
    )
  }

  return { saveDraftRegistration, clearDraft }
}
