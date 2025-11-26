import { captureException } from '@sentry/react'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { LoginRequiredError } from './apis/common'
import config from './config'
import {
  deserializeRegistrationQueryResult,
  serializeRegistrationQueryResult,
} from './registration/autosave'
import { registrationQueryKey } from './registration/query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof LoginRequiredError) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

const localStoragePersister = createAsyncStoragePersister({
  key: 'reg-frontend',
  storage: window.localStorage,
})

try {
  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    buster: String(config.version),
    dehydrateOptions: {
      serializeData: serializeRegistrationQueryResult,
      shouldDehydrateQuery: (query) =>
        query.queryKey.length === registrationQueryKey.length &&
        query.queryKey.every((value, index) => value === registrationQueryKey[index]),
    },
    hydrateOptions: {
      defaultOptions: {
        deserializeData: deserializeRegistrationQueryResult,
      },
    },
  })
} catch (error) {
  captureException(error, {
    level: 'error',
    tags: { flow: 'persistence', step: 'query-client-init' },
    extra: {
      reason: 'Failed to initialize query client persistence',
      configVersion: config.version,
    },
  })
}

export default queryClient
