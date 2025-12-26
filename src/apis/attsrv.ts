import { captureException } from '@sentry/react'
import { DateTime, Interval } from 'luxon'
import config from '../config'
import { eachDayOfInterval } from '../util/dates'
import { LoginRequiredError } from './common'

// DTO & helper types (partial, mirrored from old app)
export type PackageInfo = { name: string; count: number }

export interface AttendeeDto {
  id: number | null
  nickname: string
  first_name: string
  last_name: string
  street: string
  zip: string
  city: string
  country: string
  spoken_languages: string
  registration_language: string
  state: string | null
  email: string
  phone: string
  telegram: string | null
  partner: string | null
  birthday: string
  gender: string | null
  pronouns: string | null
  tshirt_size: string | null
  flags: string
  options: string
  packages_list: PackageInfo[]
  user_comments: string | null
}

export type RegistrationPayload = Record<string, any>

export interface CountdownDto {
  readonly countdown: number
  readonly currentTime: string
  readonly targetTime: string
}

const apiFetch = async (path: string, init?: RequestInit) => {
  const url = `${config.apis.attsrv.url}${path}`
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401) {
      throw new LoginRequiredError()
    }
    const message = body?.message || body?.error || res.statusText
    const apiError = new AttSrvAppError(message || 'API Error', {
      code: body?.message ?? null,
      status: res.status,
      body,
    })

    captureException(apiError, {
      level: 'error',
      tags: { service: 'attsrv', step: 'response' },
      extra: {
        status: res.status,
        url,
        body,
      },
    })

    throw apiError
  }

  return body
}

const weekdayKey = (dt: DateTime) => {
  switch (dt.weekday) {
    case 1:
      return 'day-mon'
    case 2:
      return 'day-tue'
    case 3:
      return 'day-wed'
    case 4:
      return 'day-thu'
    case 5:
      return 'day-fri'
    case 6:
      return 'day-sat'
    case 7:
      return 'day-sun'
    default:
      return 'day'
  }
}

// AttSrvAppError mirrors the old app's error wrapper for attsrv responses
export class AttSrvAppError extends Error {
  code: string | null
  status?: number
  body?: any

  constructor(message: string, opts?: { code?: string | null; status?: number; body?: any }) {
    super(message)
    this.name = 'AttSrvAppError'
    this.code = opts?.code ?? null
    this.status = opts?.status
    this.body = opts?.body
  }
}

// Helpers copied/ported from old attsrv
const tshirtFromApi = (apiValue: string | null) => {
  if (apiValue === '3XL') return 'm3XL'
  if (apiValue === '4XL') return 'm4XL'
  return apiValue
}

const tshirtToApi = (frontendValue: string | null) => {
  if (frontendValue === 'm3XL') return '3XL'
  if (frontendValue === 'm4XL') return '4XL'
  return frontendValue
}

const nonEmpty = (v: string) => v !== ''

const optionsToFlags = (options: Record<string, boolean>) =>
  Object.entries(options)
    .filter(([, v]: [string, any]) => v)
    .map(([k]: [string, any]) => k)
    .join(',')
const flagsToOptions = (flags: string) =>
  Object.fromEntries(
    flags
      .split(',')
      .filter(nonEmpty)
      .map((k: string) => [k, true] as const),
  )

const countAsNumber = (code: number | string): number => {
  const withoutPrefix = code.toString().replace(/^c/u, '')
  return parseInt(withoutPrefix, 10)
}

const attendeeDtoFromRegistrationInfo = (registrationInfo: any) => {
  const packagesMap = new Map<string, number>()

  registrationInfo.originalPackages?.forEach((entry: any) => {
    packagesMap.set(entry.name, entry.count)
  })

  // apply defaults & ticket choices
  packagesMap.set('room-none', 1)
  packagesMap.set('attendance', registrationInfo.ticketType?.type === 'full' ? 1 : 0)

  // day tickets mapping using interval
  if (registrationInfo.ticketType?.type === 'day' && registrationInfo.ticketType.day) {
    const weekday = registrationInfo.ticketType.day.weekday
    switch (weekday) {
      case 1:
        packagesMap.set('day-mon', 1)
        break
      case 2:
        packagesMap.set('day-tue', 1)
        break
      case 3:
        packagesMap.set('day-wed', 1)
        break
      case 4:
        packagesMap.set('day-thu', 1)
        break
      case 5:
        packagesMap.set('day-fri', 1)
        break
      case 6:
        packagesMap.set('day-sat', 1)
        break
      case 7:
        packagesMap.set('day-sun', 1)
        break
      default:
        break
    }
  }

  packagesMap.set('contributor', registrationInfo.ticketLevel?.level === 'contributor' ? 1 : 0)
  packagesMap.set('sponsor', registrationInfo.ticketLevel?.level === 'sponsor' ? 1 : 0)
  packagesMap.set('sponsor2', registrationInfo.ticketLevel?.level === 'super-sponsor' ? 1 : 0)

  // addons mapping (mirror old logic)
  // include hidden addons, stage-pass, tshirt, early/late, benefactor, fursuit, fursuitadd
  const level = registrationInfo.ticketLevel?.level

  // helper to check addon selection safely
  const addonSelected = (id: string) =>
    registrationInfo.ticketLevel?.addons?.[id]?.selected ?? false

  packagesMap.set(
    'stage',
    level &&
      !((config.ticketLevels as any)[level]?.includes?.includes('stage-pass') ?? false) &&
      addonSelected('stage-pass')
      ? 1
      : 0,
  )
  packagesMap.set(
    'tshirt',
    level &&
      !((config.ticketLevels as any)[level]?.includes?.includes('tshirt') ?? false) &&
      addonSelected('tshirt')
      ? 1
      : 0,
  )
  packagesMap.set('early', addonSelected('early') ? 1 : 0)
  packagesMap.set('late', addonSelected('late') ? 1 : 0)
  packagesMap.set(
    'benefactor',
    registrationInfo.ticketLevel?.addons?.benefactor?.selected
      ? countAsNumber(registrationInfo.ticketLevel.addons.benefactor.options.count)
      : 0,
  )
  packagesMap.set('fursuit', addonSelected('fursuit') ? 1 : 0)
  packagesMap.set(
    'fursuitadd',
    registrationInfo.ticketLevel?.addons?.fursuitadd?.selected
      ? countAsNumber(registrationInfo.ticketLevel.addons.fursuitadd.options.count)
      : 0,
  )

  const packagesList = Array.from(packagesMap.entries())
    .filter(([, c]) => c > 0)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([n, c]) => ({ name: n, count: c }))

  // hidden addons
  const hiddenAddons = Object.fromEntries(
    Object.entries(config.addons)
      .filter(([, addon]: [string, any]) => addon.hidden)
      .map(([id, _]: [string, any]) => [id, { selected: packagesMap.has(id), options: {} }]),
  )

  const addons: any = {
    ...hiddenAddons,
    'stage-pass': {
      selected:
        ((config.ticketLevels as any)[level]?.includes?.includes('stage-pass') ?? false) ||
        packagesMap.has('stage'),
      options: {},
    },
    tshirt: {
      selected:
        ((config.ticketLevels as any)[level]?.includes?.includes('tshirt') ?? false) ||
        packagesMap.has('tshirt'),
      options: {
        size: tshirtFromApi(registrationInfo.ticketLevel?.addons?.tshirt?.options?.size ?? null),
      },
    },
    fursuit: { selected: packagesMap.has('fursuit'), options: {} },
  }

  if (packagesMap.has('benefactor'))
    addons.benefactor = {
      selected: packagesMap.has('benefactor'),
      options: { count: `c${packagesMap.get('benefactor')}` },
    }
  if (packagesMap.has('fursuitadd'))
    addons.fursuitadd = {
      selected: packagesMap.has('fursuitadd'),
      options: { count: `c${packagesMap.get('fursuitadd')}` },
    }

  return {
    id: null,
    nickname: registrationInfo.personalInfo.nickname,
    first_name: registrationInfo.personalInfo.firstName,
    last_name: registrationInfo.personalInfo.lastName,
    street: registrationInfo.contactInfo?.street ?? '',
    zip: registrationInfo.contactInfo?.postalCode ?? '',
    city: registrationInfo.contactInfo?.city ?? '',
    country: registrationInfo.contactInfo?.country ?? 'DE',
    spoken_languages: (registrationInfo.personalInfo.spokenLanguages ?? []).join(','),
    registration_language: registrationInfo.preferredLocale ?? 'en-US',
    email: registrationInfo.contactInfo?.email ?? '',
    phone: registrationInfo.contactInfo?.phoneNumber ?? '',
    telegram: registrationInfo.contactInfo?.telegramUsername ?? null,
    partner: null,
    state: registrationInfo.contactInfo?.stateOrProvince ?? null,
    birthday: registrationInfo.personalInfo.dateOfBirth
      ? registrationInfo.personalInfo.dateOfBirth.toISODate()
      : '',
    gender: 'notprovided',
    pronouns: registrationInfo.personalInfo.pronouns ?? null,
    tshirt_size: tshirtToApi(registrationInfo.ticketLevel?.addons?.tshirt?.options?.size ?? null),
    flags: optionsToFlags({
      ...flagsToOptions(registrationInfo.originalFlags ?? ''),
      hc: registrationInfo.personalInfo.wheelchair,
      anon: !registrationInfo.personalInfo.fullNamePermission,
      'digi-book': registrationInfo.optionalInfo?.digitalConbook,
      'terms-accepted': true,
    }),
    options: optionsToFlags({
      anim: registrationInfo.optionalInfo?.notifications?.animation,
      art: registrationInfo.optionalInfo?.notifications?.art,
      music: registrationInfo.optionalInfo?.notifications?.music,
      suit: registrationInfo.optionalInfo?.notifications?.fursuiting,
    }),
    packages_list: packagesList,
    user_comments: registrationInfo.optionalInfo?.comments ?? null,
  }
}

export const registrationCountdownCheck = async () =>
  apiFetch('/countdown', { method: 'GET' }) as Promise<CountdownDto>

export const submitRegistration = async (registration: RegistrationPayload) =>
  apiFetch('/attendees', {
    method: 'POST',
    body: JSON.stringify(attendeeDtoFromRegistrationInfo(normalizeRegistration(registration))),
  })

interface AttendeeIdListDto {
  readonly ids: number[]
}

export const findMyRegistrations = async (): Promise<AttendeeIdListDto> => {
  try {
    return (await apiFetch('/attendees', { method: 'GET' })) as AttendeeIdListDto
  } catch (error) {
    if (
      error instanceof AttSrvAppError &&
      (error.status === 404 || error.code?.includes('attendee.owned.notfound'))
    ) {
      return { ids: [] }
    }

    captureException(error, {
      level: 'error',
      tags: { service: 'attsrv', step: 'find-my-registrations' },
      extra: {
        reason: 'Failed to fetch user registrations',
      },
    })

    throw error
  }
}

export const loadRegistration = async (id: number) =>
  apiFetch(`/attendees/${id}`, { method: 'GET' })

export const loadRegistrationStatus = async (id: number) =>
  apiFetch(`/attendees/${id}/status`, { method: 'GET' })

export const updateRegistration = async (id: number, registration: RegistrationPayload) =>
  apiFetch(`/attendees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(attendeeDtoFromRegistrationInfo(normalizeRegistration(registration))),
  })

// Normalize the flat frontend registration store into the RegistrationInfo shape
const normalizeRegistration = (reg: RegistrationPayload) => {
  // If already in nested shape (has personalInfo), return as-is
  if ((reg as any).personalInfo) return reg

  const ticketType =
    reg.type === 'day'
      ? {
          type: 'day',
          day: reg.day ? DateTime.fromISO(String(reg.day)) : undefined,
        }
      : { type: 'full' }

  const ticketLevel = {
    level: reg.level ?? 'standard',
    addons: (reg as any).addons ?? {},
  }

  const personalInfo = {
    nickname: (reg as any).nickname ?? '',
    firstName: (reg as any).firstName ?? '',
    lastName: (reg as any).lastName ?? '',
    fullNamePermission: Boolean((reg as any).fullNamePermission),
    dateOfBirth: (reg as any).dateOfBirth
      ? DateTime.fromISO(String((reg as any).dateOfBirth))
      : undefined,
    spokenLanguages: (reg as any).spokenLanguages ?? [],
    pronouns:
      (reg as any).pronounsSelection === 'other'
        ? ((reg as any).pronounsOther ?? null)
        : ((reg as any).pronounsSelection ?? null),
    wheelchair: Boolean((reg as any).wheelchair),
  }

  return {
    ticketType,
    ticketLevel,
    personalInfo,
    contactInfo: (reg as any).contactInfo ?? {},
    optionalInfo: (reg as any).optionalInfo ?? {},
    originalPackages: (reg as any).originalPackages ?? [],
    originalFlags: (reg as any).originalFlags ?? '',
    preferredLocale: (reg as any).preferredLocale ?? 'en-US',
  } as any
}

export const findExistingRegistration = async () => {
  const list = await findMyRegistrations()
  const ids: number[] = list?.ids ?? []
  if (!ids.length) return undefined
  const id = ids[0]
  try {
    const attendee = await loadRegistration(id)
    const status = await loadRegistrationStatus(id)
    // map to the old shape: { id, status: normalized, registrationInfo }
    const mapped = {
      id,
      status: String(status?.status ?? '').replaceAll(' ', '-'),
      registrationInfo: registrationInfoFromAttendeeDto(attendee),
    }
    return mapped
  } catch (err: any) {
    // if backend indicates the user has no owned registrations, return undefined
    const message = err?.body?.message || err?.message || ''
    if (typeof message === 'string' && message.includes('attendee.owned.notfound')) {
      return undefined
    }

    captureException(err, {
      level: 'error',
      tags: { service: 'attsrv', step: 'find-existing-registration' },
      extra: {
        reason: 'Failed to find existing registration',
        userId: id,
      },
    })

    throw err
  }
}

// reverse mapping: AttendeeDto -> RegistrationInfo-like shape
const registrationInfoFromAttendeeDto = (attendeeDto: any) => {
  const packagesMap = new Map((attendeeDto.packages_list || []).map((e: any) => [e.name, e.count]))
  const flags = new Set((attendeeDto.flags || '').split(',').filter(nonEmpty))
  const options = new Set((attendeeDto.options || '').split(',').filter(nonEmpty))

  const days = eachDayOfInterval(
    Interval.fromDateTimes(config.dayTicketStartDate, config.dayTicketEndDate),
  )
  const level = packagesMap.has('sponsor2')
    ? 'super-sponsor'
    : packagesMap.has('sponsor')
      ? 'sponsor'
      : packagesMap.has('contributor')
        ? 'contributor'
        : 'standard'

  const hiddenAddons = Object.fromEntries(
    Object.entries(config.addons || {})
      .filter(([, a]: [string, any]) => a.hidden)
      .map(([id, _]: [string, any]) => [id, { selected: packagesMap.has(id), options: {} }]),
  )

  const addons: any = {
    ...hiddenAddons,
    'stage-pass': {
      selected:
        ((config.ticketLevels as any)[level]?.includes?.includes('stage-pass') ?? false) ||
        packagesMap.has('stage'),
      options: {},
    },
    tshirt: {
      selected:
        ((config.ticketLevels as any)[level]?.includes?.includes('tshirt') ?? false) ||
        packagesMap.has('tshirt'),
      options: { size: tshirtFromApi(attendeeDto.tshirt_size) },
    },
    fursuit: { selected: packagesMap.has('fursuit'), options: {} },
  }

  if (packagesMap.has('benefactor'))
    addons.benefactor = {
      selected: true,
      options: { count: `c${packagesMap.get('benefactor')}` },
    }
  if (packagesMap.has('fursuitadd'))
    addons.fursuitadd = {
      selected: true,
      options: { count: `c${packagesMap.get('fursuitadd')}` },
    }

  return {
    preferredLocale: attendeeDto.registration_language,
    ticketType: packagesMap.has('attendance')
      ? { type: 'full' }
      : {
          type: 'day',
          day: days.find((d: any) => packagesMap.has(weekdayKey(d))),
        },
    ticketLevel: { level, addons },
    personalInfo: {
      nickname: attendeeDto.nickname,
      firstName: attendeeDto.first_name,
      lastName: attendeeDto.last_name,
      dateOfBirth: attendeeDto.birthday ? DateTime.fromISO(attendeeDto.birthday) : undefined,
      spokenLanguages: (attendeeDto.spoken_languages || '').split(',').filter(nonEmpty),
      pronouns: attendeeDto.pronouns === '' ? null : attendeeDto.pronouns,
      wheelchair: flags.has('hc'),
      fullNamePermission: !flags.has('anon'),
    },
    contactInfo: {
      email: attendeeDto.email,
      phoneNumber: attendeeDto.phone,
      telegramUsername: attendeeDto.telegram,
      street: attendeeDto.street,
      city: attendeeDto.city,
      postalCode: attendeeDto.zip,
      stateOrProvince: attendeeDto.state,
      country: attendeeDto.country,
    },
    optionalInfo: {
      comments: attendeeDto.user_comments,
      digitalConbook: flags.has('digi-book'),
      notifications: {
        animation: options.has('anim'),
        art: options.has('art'),
        fursuiting: options.has('suit'),
        music: options.has('music'),
      },
    },
    originalFlags: attendeeDto.flags,
    originalPackages: attendeeDto.packages_list,
  }
}
