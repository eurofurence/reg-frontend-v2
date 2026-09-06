import { useQueryClient } from '@tanstack/react-query'
import { deserializeRegistrationInfo, hasDraftRegistrationInfo } from './autosave'
import { type RegistrationQueryResult, registrationQueryKey } from './query'
import { isSubmitted, type RegistrationInfo } from './types'

// Only a draft the same user left behind is picked up again. A registration that exists on the
// server is never treated as a draft, it gets loaded fresh instead.
export const readDraft = (
  cached: RegistrationQueryResult | undefined,
  subject: string | undefined,
) => {
  if (!cached?.registration || isSubmitted(cached.registration) || cached.subject !== subject) {
    return null
  }

  const registrationInfo = deserializeRegistrationInfo(cached.registration.registrationInfo)

  if (!registrationInfo || !hasDraftRegistrationInfo(registrationInfo)) {
    return null
  }

  return { registrationInfo, lastSavedAt: cached.lastSavedAt }
}

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
      ...cached,
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
