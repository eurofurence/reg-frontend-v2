import { GTProvider, useLocale, useSetLocale } from 'gt-react'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const supportedLocales = ['en-US', 'de-DE'] as const
export type Locale = (typeof supportedLocales)[number]
export const defaultLocale: Locale = 'en-US'

const LOCALE_STORAGE_KEY = 'locale'

type Dictionary = Record<string, unknown>

// Load dictionary function for gt-react
const loadDictionary = async (locale?: string): Promise<Record<string, unknown>> => {
  const localeToLoad = locale ?? defaultLocale

  if (localeToLoad === 'en-US') {
    const en = await import('./localizations/en-US.json')
    return en.default
  }

  if (localeToLoad === 'de-DE') {
    const de = await import('./localizations/de-DE.json')
    return de.default
  }

  // Fallback to English
  const en = await import('./localizations/en-US.json')
  return en.default
}

// Dictionary context to store loaded dictionaries
const DictionaryContext = createContext<Dictionary | null>(null)

const DictionaryLoader = ({ children }: { children: ReactNode }) => {
  const locale = useLocale() as Locale | undefined
  const setLocale = useSetLocale()
  const [dictionary, setDictionary] = useState<Dictionary | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Load initial locale from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasInitialized) {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored && isLocale(stored) && stored !== locale) {
        setLocale(stored)
      }
      setHasInitialized(true)
    }
  }, [hasInitialized, locale, setLocale])

  useEffect(() => {
    const load = async () => {
      const dict = await loadDictionary(locale)
      setDictionary(dict)
    }
    load()
  }, [locale])

  // Simple locale persistence that doesn't interfere with gt-react
  useEffect(() => {
    if (typeof window !== 'undefined' && locale) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    }
  }, [locale])

  return <DictionaryContext.Provider value={dictionary}>{children}</DictionaryContext.Provider>
}

export const LocalizationProvider = ({ children }: { children: ReactNode }) => (
  <GTProvider
    locales={[...supportedLocales]}
    defaultLocale={defaultLocale}
    enableI18n={true}
    loadDictionary={loadDictionary}
    runtimeUrl={undefined}
    projectId={undefined}
  >
    <DictionaryLoader>{children}</DictionaryLoader>
  </GTProvider>
)

export const useCurrentLocale = () => {
  const locale = useLocale()
  return (locale ?? defaultLocale) as Locale
}

export const useLocaleControls = () => {
  const setLocale = useSetLocale()

  return {
    setLocale: (next: Locale) => setLocale(next),
  }
}

const isLocale = (value: string): value is Locale =>
  supportedLocales.some((locale) => locale === value)

// Helper to get nested values from dictionary objects (e.g., "key.label" or "key.caption")
const getNestedValue = (obj: unknown, path: string): string | undefined => {
  if (typeof obj !== 'object' || obj === null) {
    return undefined
  }

  const segments = path.split('.')
  let current: unknown = obj

  for (const segment of segments) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }

    current = (current as Record<string, unknown>)[segment]
  }

  if (typeof current === 'string') {
    return current
  }

  // If it's an object with a "value" property, return that
  if (typeof current === 'object' && current !== null && 'value' in current) {
    return String((current as { value: unknown }).value)
  }

  return undefined
}

// Format date using Intl.DateTimeFormat
const formatDate = (
  value: unknown,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const date = normalizeDate(value)
  if (date === null) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, options).format(date)
}

// Format date range using Intl.DateTimeFormat
const formatDateRange = (
  start: unknown,
  end: unknown,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const startDate = normalizeDate(start)
  const endDate = normalizeDate(end)

  if (startDate === null || endDate === null) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat(locale, options)

  if (typeof formatter.formatRange === 'function') {
    return formatter.formatRange(startDate, endDate)
  }

  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`
}

const normalizeDate = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return value
  }

  if (
    value &&
    typeof value === 'object' &&
    'toJSDate' in value &&
    typeof value.toJSDate === 'function'
  ) {
    return value.toJSDate()
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)

    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return null
}

// Parse DATETIME, DATETIME_RANGE placeholders, Fluent select expressions, and simple variable substitution
const processDatePlaceholders = (
  text: string,
  vars: Record<string, unknown>,
  locale: Locale,
): string => {
  // Handle DATETIME_RANGE($var1, $var2, options)
  let processed = text.replace(
    /\{DATETIME_RANGE\(\$([a-zA-Z0-9_-]+)\s*,\s*\$([a-zA-Z0-9_-]+)\s*,([^}]*)\)\}/g,
    (_, startVar: string, endVar: string, options: string) => {
      const start = vars[startVar]
      const end = vars[endVar]

      if (start === undefined || end === undefined) {
        return ''
      }

      const dateOptions = parseDateOptions(options)
      return formatDateRange(start, end, locale, dateOptions)
    },
  )

  // Handle DATETIME($var, options)
  processed = processed.replace(
    /\{DATETIME\(\$([a-zA-Z0-9_-]+)\s*,([^}]*)\)\}/g,
    (_, varName: string, options: string) => {
      const dateValue = vars[varName]

      if (dateValue === undefined) {
        return ''
      }

      const dateOptions = parseDateOptions(options)
      return formatDate(dateValue, locale, dateOptions)
    },
  )

  // Handle Fluent select expressions: {$variable -> *[default] default text [value1] text1 [value2] text2}
  processed = processed.replace(
    /\{\s*\$([a-zA-Z0-9_-]+)\s*->\s*([^}]+)\}/g,
    (_, varName: string, options: string) => {
      const varValue = vars[varName]
      const valueStr = varValue === undefined || varValue === null ? '' : String(varValue)

      // Simple parsing: split by [ and ] and extract key-value pairs
      const optionMap: Record<string, string> = {}
      let defaultText = ''

      // Split by brackets and clean up
      const bracketSplit = options.split(/[[\]]/).filter((s) => s.trim())

      for (let i = 0; i < bracketSplit.length; i += 2) {
        const key = bracketSplit[i]?.trim()
        const value = bracketSplit[i + 1]?.trim()

        if (key && value) {
          if (key.startsWith('*')) {
            // Default option (remove the * prefix)
            defaultText = value
          } else {
            optionMap[key] = value
          }
        }
      }

      // Return the matching text or default
      return optionMap[valueStr] ?? defaultText
    },
  )

  // Handle simple variable substitution: {$variable}
  processed = processed.replace(/\{\s*\$([a-zA-Z0-9_-]+)\s*\}/g, (_, name: string) => {
    const value = vars[name]
    return value === undefined || value === null ? '' : String(value)
  })

  return processed
}

const parseDateOptions = (source: string): Intl.DateTimeFormatOptions => {
  const options: Record<string, string | number | boolean> = {}
  const pairs = source
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  for (const pair of pairs) {
    const [key, rawValue] = pair.split(':').map((part) => part.trim())

    if (!key || !rawValue) {
      continue
    }

    const cleaned = rawValue.replace(/^"|"$/g, '')
    const literal = parseDateOptionLiteral(cleaned)

    options[key] = literal
  }

  return options as Intl.DateTimeFormatOptions
}

const parseDateOptionLiteral = (value: string) => {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  const numeric = Number(value)

  if (!Number.isNaN(numeric)) {
    return numeric
  }

  return value
}

// Direct dictionary access that handles our custom date formatting and nested object access
export const useDictionary = () => {
  const dictionary = useContext(DictionaryContext)
  const locale = useCurrentLocale()

  return useMemo(
    () => ({
      locale,
      translate: (key: string, vars?: Record<string, unknown>, localeOverride?: Locale) => {
        if (!dictionary) {
          return key
        }

        // Check if it's a nested key (e.g., "key.label")
        if (key.includes('.')) {
          const parts = key.split('.')
          const baseKey = parts[0]
          const nestedPath = parts.slice(1).join('.')

          // Get the base translation
          const baseTranslation = dictionary[baseKey]

          if (typeof baseTranslation === 'object' && baseTranslation !== null) {
            const nestedValue = getNestedValue(
              baseTranslation as Record<string, unknown>,
              nestedPath,
            )
            if (nestedValue !== undefined) {
              return processDatePlaceholders(nestedValue, vars ?? {}, localeOverride ?? locale)
            }
          }

          // Fallback: try as a single key
          const singleValue = dictionary[key]
          if (typeof singleValue === 'string') {
            return processDatePlaceholders(singleValue, vars ?? {}, localeOverride ?? locale)
          }

          return key
        }

        // Simple key lookup
        const translation = dictionary[key]

        if (typeof translation === 'string') {
          return processDatePlaceholders(translation, vars ?? {}, localeOverride ?? locale)
        }

        // If it's an object with a "value" property, use that
        if (typeof translation === 'object' && translation !== null && 'value' in translation) {
          const value = String((translation as { value: unknown }).value)
          return processDatePlaceholders(value, vars ?? {}, localeOverride ?? locale)
        }

        return key
      },
      raw: (key: string, _localeOverride?: Locale) => {
        if (!dictionary) {
          return key
        }

        // For raw access, we don't process placeholders
        if (key.includes('.')) {
          const parts = key.split('.')
          const baseKey = parts[0]
          const nestedPath = parts.slice(1).join('.')

          const baseTranslation = dictionary[baseKey]

          if (typeof baseTranslation === 'object' && baseTranslation !== null) {
            return getNestedValue(baseTranslation as Record<string, unknown>, nestedPath) ?? key
          }
        }

        const translation = dictionary[key]

        if (typeof translation === 'string') {
          return translation
        }

        if (typeof translation === 'object' && translation !== null && 'value' in translation) {
          return String((translation as { value: unknown }).value)
        }

        return key
      },
    }),
    [dictionary, locale],
  )
}

export const useTranslations = (prefix?: string) => {
  const { translate, raw } = useDictionary()

  return useMemo(() => {
    const toKey = (key: string) => (prefix ? `${prefix}.${key}` : key)
    const t = (key: string, vars?: Record<string, unknown>, localeOverride?: Locale) =>
      translate(toKey(key), vars, localeOverride)

    t.obj = (key: string, localeOverride?: Locale) => raw(toKey(key), localeOverride)

    return t
  }, [prefix, raw, translate])
}
