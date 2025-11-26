import { useQuery } from '@tanstack/react-query'
import config from '~/config'
import { ApiRequestError, requestJson } from './common'

export interface UserInfo {
  subject: string
  name: string
  email: string
  emailVerified: boolean
  groups: readonly string[]
}

interface UserInfoDto {
  readonly subject: string
  readonly name: string
  readonly email: string
  readonly email_verified: boolean
  readonly groups: readonly string[]
}

export class AuthSrvAppError extends ApiRequestError {
  constructor(status: number, body: unknown) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message?: string }).message)
        : 'Authentication service error'
    super('authsrv', status, body, message)
  }
}

const mapUserInfoDto = (dto: UserInfoDto): UserInfo => ({
  subject: dto.subject,
  name: dto.name,
  email: dto.email,
  emailVerified: dto.email_verified,
  groups: dto.groups ?? [],
})

export const fetchCurrentUser = async () =>
  mapUserInfoDto(
    await requestJson<UserInfoDto>({
      service: 'authsrv',
      baseUrl: config.apis.authsrv.url,
      path: '/frontend-userinfo',
      tags: { flow: 'auth', step: 'frontend-userinfo' },
      transformError: ({ response, body }) => new AuthSrvAppError(response.status, body),
    }),
  )

export const userInfoQueryKey = ['auth', 'user-info'] as const

export const useUserInfoQuery = () =>
  useQuery({
    queryKey: userInfoQueryKey,
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
  })

export const startLoginRedirect = (returnTo?: string) => {
  const dropoffUrl =
    import.meta.env.DEV || import.meta.env.MODE === 'development'
      ? ''
      : `&dropoff_url=${encodeURIComponent(returnTo ?? window.location.href)}`

  window.location.href = `${config.apis.authsrv.url}/auth?app_name=${config.apis.authsrv.appName}${dropoffUrl}`
}
