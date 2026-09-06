import type { CountdownDto } from '~/apis/attsrv'
import type { Registration } from './types'

export const registrationQueryKey = ['registration', 'state'] as const

export interface RegistrationQueryResult {
  readonly isOpen: boolean | null
  readonly subject?: string
  readonly countdown?: CountdownDto
  readonly registration?: Registration
  readonly lastSavedAt?: string
}
