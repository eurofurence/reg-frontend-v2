import { captureException } from '@sentry/react'

export const load = <T>(id: string) => {
  try {
    const serializedData = 'localStorage' in globalThis ? localStorage.getItem(id) : null

    return serializedData === null ? null : (JSON.parse(serializedData) as T)
  } catch (error) {
    captureException(error, {
      level: 'error',
      tags: { flow: 'local-storage', step: 'load' },
      extra: {
        reason: 'Failed to load data from localStorage',
        id,
      },
    })
    return null
  }
}

export const save = (id: string, saveData: unknown) => {
  try {
    if ('localStorage' in globalThis) {
      localStorage.setItem(id, JSON.stringify(saveData))
    }
  } catch (error) {
    captureException(error, {
      level: 'error',
      tags: { flow: 'local-storage', step: 'save' },
      extra: {
        reason: 'Failed to save data to localStorage',
        id,
        dataType: typeof saveData,
      },
    })
  }
}

export const remove = (id: string) => {
  try {
    if ('localStorage' in globalThis) {
      localStorage.removeItem(id)
    }
  } catch (error) {
    captureException(error, {
      level: 'error',
      tags: { flow: 'local-storage', step: 'remove' },
      extra: {
        reason: 'Failed to remove data from localStorage',
        id,
      },
    })
  }
}
