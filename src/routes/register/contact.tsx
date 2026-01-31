import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { countryCodeEmoji } from 'country-code-emoji'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useUserInfoQuery } from '~/apis/authsrv'
import WithInvoiceRegisterFunnelLayout from '~/components/funnels/WithInvoiceRegisterFunnelLayout'
import Select from '~/components/ui/controls/forms/select'
import TextField from '~/components/ui/controls/forms/text-field'
import Form from '~/components/ui/layout/form'
import config from '~/config'
import { useCurrentLocale, useTranslations } from '~/localization'
import { hasDraftRegistrationInfo } from '~/registration/autosave'
import { useDraftRegistration, useRegistrationQuery } from '~/registration/hooks'
import { type ContactInfo, isSubmitted } from '~/registration/types'

const reEmail = /^[^@\p{Space_Separator}]+@[^@\p{Space_Separator}]+$/u
const reTelegram = /^@.+$/u

type ContactFormValues = {
  email: string
  phoneNumber: string
  telegramUsername: string
  street: string
  city: string
  postalCode: string
  stateOrProvince: string
  country: string
}

const allowedCountries = config.allowedCountries
const isAllowedCountry = (value: string): value is ContactInfo['country'] =>
  allowedCountries.includes(value as (typeof allowedCountries)[number])

export const Route = createFileRoute('/register/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: registrationData, isLoading } = useRegistrationQuery()
  const { data: userInfo } = useUserInfoQuery()
  const { saveDraftRegistration } = useDraftRegistration()
  const navigate = useNavigate()
  const t = useTranslations()
  const locale = useCurrentLocale()

  const registration = registrationData?.registration
  const existingContact = registration?.registrationInfo?.contactInfo

  const verifiedEmails = useMemo(() => {
    const values = new Set<string>()

    if (userInfo?.email) {
      values.add(userInfo.email)
    }

    if (registration && isSubmitted(registration) && existingContact?.email) {
      values.add(existingContact.email)
    }

    return Array.from(values)
  }, [existingContact?.email, registration, userInfo?.email])

  const defaultValues = useMemo<ContactFormValues>(
    () => ({
      email: existingContact?.email ?? userInfo?.email ?? '',
      phoneNumber: existingContact?.phoneNumber ?? '',
      telegramUsername: existingContact?.telegramUsername ?? '',
      street: existingContact?.street ?? '',
      city: existingContact?.city ?? '',
      postalCode: existingContact?.postalCode ?? '',
      stateOrProvince: existingContact?.stateOrProvince ?? '',
      country: existingContact?.country ?? '',
    }),
    [existingContact, userInfo?.email],
  )

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  // Redirect to step 1 if no draft data exists
  useEffect(() => {
    if (!isLoading && !hasDraftRegistrationInfo(registration?.registrationInfo)) {
      navigate({ href: '/register/ticket/type' })
    }
  }, [isLoading, navigate, registration?.registrationInfo])

  const { countryOptions, countryOptionsByValue } = useMemo(() => {
    const formatter = new Intl.Collator(locale)
    const enriched = allowedCountries.map((code) => {
      const emoji = (() => {
        try {
          return countryCodeEmoji(code)
        } catch {
          return ''
        }
      })()
      const name = t(`country-name.${code}`)
      return {
        value: code,
        label: `${emoji} ${name}`.trim(),
      }
    })

    const sorted = enriched.sort((a, b) => formatter.compare(a.label, b.label))

    return {
      countryOptions: sorted,
      countryOptionsByValue: new Map(sorted.map((o) => [o.value, o])),
    }
  }, [locale, t])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (registrationData?.isOpen === false) {
    return <div>Registration is not open yet.</div>
  }

  const onSubmit = (data: ContactFormValues) => {
    const country = isAllowedCountry(data.country) ? data.country : allowedCountries[0]

    saveDraftRegistration((prev) => ({
      ...prev,
      contactInfo: {
        email: data.email.trim(),
        phoneNumber: data.phoneNumber.trim(),
        telegramUsername: (() => {
          const trimmed = data.telegramUsername?.trim()
          return trimmed ? (trimmed.startsWith('@') ? trimmed : `@${trimmed}`) : null
        })(),
        street: data.street.trim(),
        city: data.city.trim(),
        postalCode: data.postalCode.trim(),
        stateOrProvince: data.stateOrProvince?.trim() ? data.stateOrProvince.trim() : null,
        country,
      },
    }))

    navigate({ href: '/register/optional' })
  }

  return (
    <WithInvoiceRegisterFunnelLayout currentStep={3} onNext={handleSubmit(onSubmit)}>
      <h3>{t('register-contact-info-title')}</h3>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label={t('register-contact-info-email.label')}
          placeholder={t('register-contact-info-email.placeholder')}
          type="email"
          error={errors.email?.message}
          {...register('email', {
            required: t('register-contact-info-validation-errors-email-required'),
            maxLength: {
              value: 200,
              message: t('register-contact-info-validation-errors-email-max-length', {
                limit: 200,
              }),
            },
            pattern: {
              value: reEmail,
              message: t('register-contact-info-validation-errors-email-pattern'),
            },
            validate: {
              isVerified: (value) =>
                verifiedEmails.length === 0 ||
                verifiedEmails.includes(value) ||
                t('register-contact-info-validation-errors-email-validate-is-verified'),
            },
          })}
        />

        <TextField
          label={t('register-contact-info-phone-number.label')}
          placeholder={t('register-contact-info-phone-number.placeholder')}
          type="tel"
          gridSpan={5}
          error={errors.phoneNumber?.message}
          {...register('phoneNumber', {
            required: t('register-contact-info-validation-errors-phone-number-required'),
            maxLength: {
              value: 32,
              message: t('register-contact-info-validation-errors-phone-number-max-length', {
                limit: 32,
              }),
            },
          })}
        />

        <TextField
          label={t('register-contact-info-telegram-username.label')}
          placeholder={t('register-contact-info-telegram-username.placeholder')}
          gridSpan={5}
          error={errors.telegramUsername?.message}
          {...register('telegramUsername', {
            maxLength: {
              value: 80,
              message: t('register-contact-info-validation-errors-telegram-username-max-length', {
                limit: 80,
              }),
            },
            onChange: (e) => {
              const value = e.target.value
              if (value && !value.startsWith('@') && value.length > 0) {
                setValue('telegramUsername', `@${value}`, { shouldValidate: true })
              }
            },
            validate: (value) =>
              value.length === 0 ||
              reTelegram.test(value) ||
              t('register-contact-info-validation-errors-telegram-username-pattern'),
          })}
        />

        <TextField
          label={t('register-contact-info-street.label')}
          placeholder={t('register-contact-info-street.placeholder')}
          error={errors.street?.message}
          {...register('street', {
            required: t('register-contact-info-validation-errors-street-required'),
            maxLength: {
              value: 120,
              message: t('register-contact-info-validation-errors-street-max-length', {
                limit: 120,
              }),
            },
          })}
        />

        <TextField
          label={t('register-contact-info-postal-code.label')}
          placeholder="8888"
          gridSpan={4}
          error={errors.postalCode?.message}
          {...register('postalCode', {
            required: t('register-contact-info-validation-errors-postal-code-required'),
            maxLength: {
              value: 20,
              message: t('register-contact-info-validation-errors-postal-code-max-length', {
                limit: 20,
              }),
            },
          })}
        />

        <TextField
          label={t('register-contact-info-city.label')}
          placeholder="Zootopia"
          gridSpan={6}
          error={errors.city?.message}
          {...register('city', {
            required: t('register-contact-info-validation-errors-city-required'),
            maxLength: {
              value: 80,
              message: t('register-contact-info-validation-errors-city-max-length', {
                limit: 80,
              }),
            },
          })}
        />

        <TextField
          label={t('register-contact-info-state-or-province.label')}
          placeholder="Fur Valley"
          gridSpan={5}
          error={errors.stateOrProvince?.message}
          {...register('stateOrProvince', {
            maxLength: {
              value: 80,
              message: t('register-contact-info-validation-errors-state-or-province-max-length', {
                limit: 80,
              }),
            },
          })}
        />

        <Controller
          control={control}
          name="country"
          rules={{
            required: t('register-contact-info-validation-errors-country-required'),
            validate: (value) =>
              !value ||
              isAllowedCountry(value) ||
              t('register-contact-info-validation-errors-country-max-length'),
          }}
          render={({ field: { onChange, value, ref, ...field } }) => (
            <Select
              label={t('register-contact-info-country.label')}
              gridSpan={5}
              options={countryOptions}
              onChange={(option) => onChange(option?.value)}
              value={
                value === null || value === undefined
                  ? null
                  : countryOptionsByValue.get(value as ContactInfo['country'])
              }
              error={errors.country?.message}
              {...field}
            />
          )}
        />
      </Form>
    </WithInvoiceRegisterFunnelLayout>
  )
}
