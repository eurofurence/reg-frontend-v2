import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { StatusCodes } from 'http-status-codes'
import { sum } from 'ramda'
import config from '~/config'
import { ApiRequestError, requestJson } from './common'

export type TransactionType = 'due' | 'payment'
export type Method = 'credit' | 'paypal' | 'transfer' | 'internal' | 'gift'
export type Status = 'tentative' | 'pending' | 'valid' | 'deleted'

export interface Amount {
  readonly currency: string
  readonly gross_cent: number
  readonly vat_rate: number
}

export interface TransactionDto {
  readonly debitor_id: number
  readonly transaction_identifier: string
  readonly transaction_type: TransactionType
  readonly method: Method
  readonly amount: Amount
  readonly comment: string
  readonly status: Status
  readonly payment_start_url: string
  readonly effective_date: string
  readonly due_date: string
  readonly creation_date: string
}

interface TransactionResponseDto {
  readonly payload: readonly TransactionDto[]
}

interface InitiatePaymentResponseDto {
  readonly transaction: TransactionDto
}

export class PaySrvAppError extends ApiRequestError {
  constructor(status: number, body: unknown) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message?: string }).message)
        : 'Payment service error'
    super('paysrv', status, body, message)
  }
}

export const calculateTotalPaid = (transactions: readonly TransactionDto[]) =>
  sum(
    transactions
      .filter((t) => t.status === 'valid' && t.transaction_type === 'payment')
      .map((t) => t.amount.gross_cent),
  )

export const calculateOutstandingDues = (transactions: readonly TransactionDto[]) =>
  sum(
    transactions
      .filter((t) => t.status === 'valid')
      .map((t) => (t.transaction_type === 'due' ? t.amount.gross_cent : -t.amount.gross_cent)),
  )

export const hasUnprocessedPayments = (transactions: readonly TransactionDto[]) =>
  transactions.some((t) => t.status === 'pending' && t.transaction_type === 'payment')

export const fetchTransactionsForBadgeNumber = async (badgeNumber: number) => {
  try {
    const result = await requestJson<TransactionResponseDto>({
      service: 'paysrv',
      baseUrl: config.apis.paysrv.url,
      path: `/transactions?debitor_id=${badgeNumber}`,
      tags: { flow: 'payments', step: 'transactions' },
      transformError: ({ response, body }) => new PaySrvAppError(response.status, body),
    })
    return result.payload
  } catch (error) {
    if (error instanceof PaySrvAppError && error.status === StatusCodes.NOT_FOUND) {
      return []
    }

    throw error
  }
}

const initiatePayment = async (badgeNumber: number, method?: Method) => {
  const response = await requestJson<InitiatePaymentResponseDto>({
    service: 'paysrv',
    baseUrl: config.apis.paysrv.url,
    path: '/transactions/initiate-payment',
    method: 'POST',
    body:
      method === undefined
        ? { debitor_id: badgeNumber }
        : {
            debitor_id: badgeNumber,
            method,
          },
    tags: { flow: 'payments', step: 'initiate-payment' },
    transformError: ({ response, body }) => new PaySrvAppError(response.status, body),
  })

  return response.transaction
}

export const transactionsQueryKey = (badgeNumber: number) =>
  ['paysrv', 'transactions', badgeNumber] as const

export const useTransactionsQuery = (
  badgeNumber: number | null | undefined,
): UseQueryResult<readonly TransactionDto[], unknown> =>
  useQuery({
    queryKey: transactionsQueryKey(badgeNumber ?? -1),
    queryFn: () => fetchTransactionsForBadgeNumber(badgeNumber as number),
    enabled: typeof badgeNumber === 'number' && Number.isFinite(badgeNumber),
    staleTime: 60 * 1000,
  })

export const initiateCreditCardPayment = (badgeNumber: number) =>
  initiatePayment(badgeNumber, 'credit')

export const initiateSepaPayment = (badgeNumber: number) => initiatePayment(badgeNumber, 'transfer')

export const useInitiateCreditCardPaymentMutation = (): UseMutationResult<
  TransactionDto,
  unknown,
  number
> =>
  useMutation({
    mutationFn: initiateCreditCardPayment,
  })

export const useInitiateSepaPaymentMutation = (): UseMutationResult<
  TransactionDto,
  unknown,
  number
> =>
  useMutation({
    mutationFn: initiateSepaPayment,
  })
