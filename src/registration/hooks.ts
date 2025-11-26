import { captureException } from '@sentry/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  findExistingRegistration,
  registrationCountdownCheck,
  submitRegistration,
  updateRegistration,
} from '~/apis/attsrv'
import {
  calculateOutstandingDues,
  calculateTotalPaid,
  fetchTransactionsForBadgeNumber,
  hasUnprocessedPayments,
  initiateCreditCardPayment,
  initiateSepaPayment,
} from '~/apis/paysrv'
import { queryClient } from '~/queryClient'
import { includes } from '~/util/includes'
import { deserializeRegistrationInfo, hasDraftRegistrationInfo } from './autosave'
import { type RegistrationQueryResult, registrationQueryKey } from './query'
import type {
  ApprovedRegistration,
  PendingRegistration,
  Registration,
  RegistrationInfo,
} from './types'

const mapPendingRegistration = (
  id: number,
  status: PendingRegistration['status'],
  registrationInfo: RegistrationInfo,
): PendingRegistration => ({
  id,
  status,
  registrationInfo,
})

const mapApprovedRegistration = async (
  id: number,
  status: ApprovedRegistration['status'],
  registrationInfo: RegistrationInfo,
): Promise<ApprovedRegistration> => {
  const transactions = await fetchTransactionsForBadgeNumber(id)
  return {
    id,
    status,
    registrationInfo,
    paymentInfo: {
      paid: calculateTotalPaid(transactions) / 100,
      due: calculateOutstandingDues(transactions) / 100,
      unprocessedPayments: hasUnprocessedPayments(transactions),
    },
  }
}

const getDraftRegistrationFromCache = () => {
  const cached = queryClient.getQueryData<RegistrationQueryResult>(registrationQueryKey)
  const normalizedInfo = deserializeRegistrationInfo(cached?.registration?.registrationInfo)

  if (!hasDraftRegistrationInfo(normalizedInfo)) {
    return null
  }

  return {
    registrationInfo: normalizedInfo,
    lastSavedAt: cached?.lastSavedAt,
  }
}

const loadRegistrationState = async (): Promise<RegistrationQueryResult> => {
  try {
    const countdown = await registrationCountdownCheck()

    if (countdown.countdown > 0) {
      return { isOpen: false, countdown }
    }

    const existing = await findExistingRegistration()
    const draft = getDraftRegistrationFromCache()

    // If user has existing submitted registration, load it (prevent duplicate registration)
    if (existing !== undefined) {
      const normalizedStatus = existing.status as Registration['status']
      const existingInfo = existing.registrationInfo as RegistrationInfo

      if (includes(['new', 'waiting'] as const, normalizedStatus)) {
        return {
          isOpen: true,
          registration: mapPendingRegistration(
            existing.id,
            normalizedStatus as PendingRegistration['status'],
            existingInfo,
          ),
        }
      }

      if (
        includes(
          ['approved', 'partially-paid', 'paid', 'checked-in', 'cancelled'] as const,
          normalizedStatus,
        )
      ) {
        return {
          isOpen: true,
          registration: await mapApprovedRegistration(
            existing.id,
            normalizedStatus as ApprovedRegistration['status'],
            existingInfo,
          ),
        }
      }
    }

    // If user has draft data, allow continuing draft (only if no existing registration)
    if (draft?.registrationInfo && Object.keys(draft.registrationInfo).length > 0) {
      return {
        isOpen: true,
        registration: {
          status: 'unsubmitted',
          registrationInfo: draft.registrationInfo,
        },
        lastSavedAt: draft.lastSavedAt,
      }
    }

    // If no existing registration and no draft, allow new registration
    if (existing === undefined) {
      return {
        isOpen: true,
        registration: {
          status: 'unsubmitted',
          registrationInfo: {},
        },
      }
    }

    // Fallback - shouldn't reach here
    return {
      isOpen: true,
      registration: {
        status: 'unsubmitted',
        registrationInfo: {},
      },
    }
  } catch (error) {
    captureException(error, {
      level: 'error',
      tags: { flow: 'registration', step: 'load_state' },
      extra: {
        reason: 'loading registration state',
      },
    })
    throw error
  }
}

export const useRegistrationQuery = () =>
  useQuery({
    queryKey: registrationQueryKey,
    queryFn: loadRegistrationState,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: 0,
    gcTime: Infinity,
    networkMode: 'offlineFirst',
  })

export const useSubmitRegistrationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (registrationInfo: RegistrationInfo) => {
      await submitRegistration(registrationInfo)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: registrationQueryKey })
    },
    onError: (error) => {
      captureException(error, {
        level: 'error',
        tags: { flow: 'registration', step: 'submit-mutation' },
        extra: {
          reason: 'Registration submission mutation failed',
        },
      })
    },
  })
}

export const useUpdateRegistrationMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      registrationInfo,
    }: {
      id: number
      registrationInfo: RegistrationInfo
    }) => {
      await updateRegistration(id, registrationInfo)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: registrationQueryKey })
    },
    onError: (error, variables) => {
      captureException(error, {
        level: 'error',
        tags: { flow: 'registration', step: 'update-mutation' },
        extra: {
          reason: 'Registration update mutation failed',
          registrationId: variables.id,
        },
      })
    },
  })
}

export const useDraftRegistration = () => {
  const queryClient = useQueryClient()

  const saveDraftRegistration = (
    updater: (prev: Partial<RegistrationInfo>) => Partial<RegistrationInfo>,
  ) => {
    const cached = queryClient.getQueryData<RegistrationQueryResult>(registrationQueryKey)
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

export const useInitiateCreditCardPayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: initiateCreditCardPayment,
    onSuccess: (transaction) => {
      void queryClient.invalidateQueries({ queryKey: registrationQueryKey })
      window.location.assign(transaction.payment_start_url)
    },
    onError: (error) => {
      console.error('Failed to initiate credit card payment:', error)
      captureException(error, {
        level: 'error',
        tags: { flow: 'payment', step: 'credit-card' },
        extra: {
          reason: 'Failed to initiate credit card payment',
        },
      })
    },
  })
}

export const useInitiateSepaPayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: initiateSepaPayment,
    onSuccess: (transaction) => {
      void queryClient.invalidateQueries({ queryKey: registrationQueryKey })
      window.location.assign(transaction.payment_start_url)
    },
    onError: (error) => {
      console.error('Failed to initiate SEPA payment:', error)
      captureException(error, {
        level: 'error',
        tags: { flow: 'payment', step: 'sepa' },
        extra: {
          reason: 'Failed to initiate SEPA payment',
        },
      })
    },
  })
}
