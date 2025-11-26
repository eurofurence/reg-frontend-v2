import { captureException } from '@sentry/react'
import { DateTime } from 'luxon'
import config from '~/config'
import type { RegistrationInfo, TicketLevelAddons } from './types'

type DeepDateToString<T> = T extends DateTime
  ? string
  : T extends object
    ? { [K in keyof T]: DeepDateToString<T[K]> }
    : T extends readonly (infer U)[]
      ? DeepDateToString<U>[]
      : T

export interface DraftSaveData {
  readonly registrationInfo?: Partial<RegistrationInfo>
  readonly lastSavedAt?: string
}

type SerializedSaveData = DeepDateToString<DraftSaveData>
type SerializedRegistrationInfo = NonNullable<SerializedSaveData['registrationInfo']>
type SerializedTicketType = SerializedRegistrationInfo['ticketType']
type SerializedPersonalInfo = SerializedRegistrationInfo['personalInfo']

const serializeTicketType = (
  ticketType: RegistrationInfo['ticketType'] | undefined,
): SerializedTicketType => {
  if (ticketType === undefined) {
    return undefined
  }

  if (ticketType.type !== 'day') {
    return ticketType as SerializedTicketType
  }

  const day = ticketType.day?.toISODate() ?? ticketType.day?.toISO()
  if (day === null || day === undefined) {
    return undefined
  }

  return {
    ...ticketType,
    day,
  } as SerializedTicketType
}

const serializePersonalInfo = (
  personalInfo: RegistrationInfo['personalInfo'] | undefined,
): SerializedPersonalInfo => {
  if (personalInfo === undefined) {
    return undefined
  }

  const dateOfBirth =
    personalInfo.dateOfBirth.toISODate() ?? personalInfo.dateOfBirth.toISO() ?? undefined

  if (dateOfBirth === undefined) {
    return undefined
  }

  return {
    ...personalInfo,
    dateOfBirth,
  } as SerializedPersonalInfo
}

const deserializeTicketType = (
  ticketType: RegistrationInfo['ticketType'] | SerializedTicketType | undefined,
): RegistrationInfo['ticketType'] | undefined => {
  if (!ticketType) {
    return undefined
  }

  if (ticketType.type !== 'day') {
    return ticketType
  }

  const rawDay = ticketType.day

  if (!rawDay) {
    return {
      ...ticketType,
      day: DateTime.fromISO('2025-09-03', { zone: 'Europe/Berlin' }),
    }
  }

  const day =
    typeof rawDay === 'string' ? DateTime.fromISO(rawDay, { zone: 'Europe/Berlin' }) : rawDay

  if (!day?.isValid) {
    return {
      ...ticketType,
      day: DateTime.fromISO('2025-08-13T10:00:00', { zone: 'Europe/Berlin' }),
    }
  }

  return {
    ...ticketType,
    day,
  }
}

const deserializePersonalInfo = (
  personalInfo: RegistrationInfo['personalInfo'] | SerializedPersonalInfo | undefined,
): RegistrationInfo['personalInfo'] | undefined => {
  if (!personalInfo || !personalInfo.dateOfBirth) {
    return undefined
  }

  const date =
    typeof personalInfo.dateOfBirth === 'string'
      ? DateTime.fromISO(personalInfo.dateOfBirth, { zone: 'Europe/Berlin' })
      : personalInfo.dateOfBirth

  if (!date?.isValid) {
    return undefined
  }

  return {
    ...personalInfo,
    dateOfBirth: date,
  }
}

const isConfiguredAsAddon = (idCandidate: string) => Object.hasOwn(config.addons, idCandidate)

const isUnavailableAddonForType = (addonId: string, ticketType: 'full' | 'day') => {
  if (!isConfiguredAsAddon(addonId)) {
    return false
  }

  const addon = config.addons[addonId as keyof typeof config.addons]
  return addon?.unavailableFor?.type?.includes(ticketType) ?? false
}

const hasWrongAddons = (addons: TicketLevelAddons) =>
  Object.keys(addons).some((id) => !isConfiguredAsAddon(id))

const hasUnavailableSelectedAddons = (addons: TicketLevelAddons, ticketType: 'full' | 'day') =>
  Object.entries(addons)
    .filter(([, { selected }]) => selected)
    .some(([id]) => isUnavailableAddonForType(id, ticketType))

export const isValidDraftRegistrationInfo = (ri: Partial<RegistrationInfo>): boolean => {
  if (ri.ticketType && ri.ticketLevel) {
    return (
      !hasWrongAddons(ri.ticketLevel.addons) &&
      !hasUnavailableSelectedAddons(ri.ticketLevel.addons, ri.ticketType.type)
    )
  }

  if (ri.ticketType || ri.ticketLevel || ri.personalInfo || ri.contactInfo || ri.optionalInfo) {
    return true
  }

  return false
}

export const serializeRegistrationInfo = (
  info: Partial<RegistrationInfo> | undefined,
): SerializedRegistrationInfo | undefined => {
  try {
    if (!info) {
      return undefined
    }

    return {
      ...info,
      ticketType: serializeTicketType(info.ticketType),
      personalInfo: serializePersonalInfo(info.personalInfo),
    } as SerializedRegistrationInfo
  } catch (error) {
    captureException(error, {
      level: 'error',
      tags: { flow: 'autosave', step: 'serialize' },
      extra: {
        reason: 'Failed to serialize registration info',
        infoKeys: info ? Object.keys(info) : [],
      },
    })
    return undefined
  }
}

export const deserializeRegistrationInfo = (
  info: Partial<RegistrationInfo> | SerializedRegistrationInfo | undefined,
): Partial<RegistrationInfo> | undefined => {
  try {
    if (!info) {
      return undefined
    }

    return {
      ...info,
      ticketType: deserializeTicketType(info.ticketType),
      personalInfo: deserializePersonalInfo(info.personalInfo),
    }
  } catch (error) {
    captureException(error, {
      level: 'error',
      tags: { flow: 'autosave', step: 'deserialize' },
      extra: {
        reason: 'Failed to deserialize registration info',
        infoKeys: info ? Object.keys(info) : [],
      },
    })
    return undefined
  }
}

const isRegistrationQueryResultLike = (
  value: unknown,
): value is { registration?: { registrationInfo?: Partial<RegistrationInfo> } } =>
  Boolean(
    value &&
      typeof value === 'object' &&
      'registration' in value &&
      (value as any).registration !== undefined,
  )

export const serializeRegistrationQueryResult = (value: unknown): unknown => {
  if (!isRegistrationQueryResultLike(value)) {
    return value
  }

  const registration = (value as any).registration

  if (!registration?.registrationInfo) {
    return value
  }

  return {
    ...(value as any),
    registration: {
      ...registration,
      registrationInfo: serializeRegistrationInfo(registration.registrationInfo),
    },
  }
}

export const deserializeRegistrationQueryResult = (value: unknown): unknown => {
  if (!isRegistrationQueryResultLike(value)) {
    return value
  }

  const registration = (value as any).registration

  if (!registration?.registrationInfo) {
    return value
  }

  return {
    ...(value as any),
    registration: {
      ...registration,
      registrationInfo: deserializeRegistrationInfo(registration.registrationInfo),
    },
  }
}

export const hasDraftRegistrationInfo = (info: Partial<RegistrationInfo> | undefined) =>
  Boolean(info && Object.keys(info).length > 0 && isValidDraftRegistrationInfo(info))
