import { captureException } from '@sentry/react'
import { StatusCodes } from 'http-status-codes'

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly service: string,
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class LoginRequiredError extends Error {
  constructor() {
    super('Login required')
    this.name = 'LoginRequiredError'
  }
}

export class ApiRequestError extends Error {
  constructor(
    public readonly service: string,
    public readonly status: number,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `Request to ${service} failed with status ${status}`)
    this.name = 'ApiRequestError'
  }
}

interface RequestJsonOptions {
  service: string
  baseUrl: string
  path: string
  method?: string
  headers?: HeadersInit
  body?: unknown
  tags?: Record<string, string>
  transformError?: (params: { response: Response; body: unknown }) => Error
}

export const requestJson = async <T>({
  service,
  baseUrl,
  path,
  method = 'GET',
  headers,
  body,
  tags,
  transformError,
}: RequestJsonOptions): Promise<T> => {
  const url = `${baseUrl}${path}`
  let response: Response

  const requestInit: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
  }

  if (body !== undefined) {
    if (typeof body === 'string' || body instanceof FormData || body instanceof Blob) {
      requestInit.body = body
    } else {
      requestInit.body = JSON.stringify(body)
    }
  }

  try {
    response = await fetch(url, requestInit)
  } catch (error) {
    captureException(error, {
      level: 'error',
      tags: { service, ...(tags ?? {}), step: 'network' },
      extra: {
        message: `Network error while calling ${service}`,
        url,
      },
    })
    throw new NetworkError(`Network error while calling ${url}`, service)
  }

  const text = await response.text()
  let parsed: unknown = null
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
  }

  if (!response.ok) {
    if (response.status === StatusCodes.UNAUTHORIZED) {
      throw new LoginRequiredError()
    }

    const apiError =
      transformError?.({ response, body: parsed }) ??
      new ApiRequestError(service, response.status, parsed, response.statusText)

    captureException(apiError, {
      level: 'error',
      tags: { service, ...(tags ?? {}), step: 'response' },
      extra: {
        status: response.status,
        url,
        body: parsed,
      },
    })

    throw apiError
  }

  return (parsed ?? null) as T
}
