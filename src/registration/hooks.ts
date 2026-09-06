import { captureException } from '@sentry/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  findExistingRegistration,
  registrationCountdownCheck,
  submitRegistration,
  updateRegistration,
} from '~/apis/attsrv'
import { type UserInfo, userInfoQueryKey } from '~/apis/authsrv'
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
import { readDraft } from './draft'
import { type RegistrationQueryResult, registrationQueryKey } from './query'
import type {
  ApprovedRegistration,
  PendingRegistration,
  Registration,
  RegistrationInfo,
} from './types'

export { useDraftRegistration } from './draft'

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

const loadRegistrationState = async (): Promise<RegistrationQueryResult> => {
  try {
    const subject = queryClient.getQueryData<UserInfo>(userInfoQueryKey)?.subject
    const countdown = await registrationCountdownCheck()

    if (countdown.countdown > 0) {
      return { isOpen: false, countdown, subject }
    }

    const existing = await findExistingRegistration()
    const draft = readDraft(
      queryClient.getQueryData<RegistrationQueryResult>(registrationQueryKey),
      subject,
    )

    // If user has existing submitted registration, load it (prevent duplicate registration)
    if (existing !== undefined) {
      const normalizedStatus = existing.status as Registration['status']
      const existingInfo = existing.registrationInfo as RegistrationInfo

      if (includes(['new', 'waiting'] as const, normalizedStatus)) {
        return {
          isOpen: true,
          subject,
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
          subject,
          registration: await mapApprovedRegistration(
            existing.id,
            normalizedStatus as ApprovedRegistration['status'],
            existingInfo,
          ),
        }
      }
    }

    // If user has draft data, allow continuing draft (only if no existing registration)
    if (draft) {
      return {
        isOpen: true,
        subject,
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
        subject,
        registration: {
          status: 'unsubmitted',
          registrationInfo: {},
        },
      }
    }

    // Fallback - shouldn't reach here
    return {
      isOpen: true,
      subject,
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

      alert(`Registration update failed: ${error.message || 'Unknown error'}`)
    },
  })
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
