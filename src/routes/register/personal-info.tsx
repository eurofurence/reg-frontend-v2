import { createFileRoute, useNavigate } from '@tanstack/react-router'
// @ts-expect-error
import langMap from 'langmap'
import { DateTime } from 'luxon'
import { pluck, prop, sortBy } from 'ramda'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslations } from '~/localization'
import { hasDraftRegistrationInfo } from '~/registration/autosave'
import { useDraftRegistration, useRegistrationQuery } from '~/registration/hooks'
import { addRegistrationBreadcrumb } from '~/util/sentry'
import WithInvoiceRegisterFunnelLayout from '../../components/funnels/WithInvoiceRegisterFunnelLayout'
import Checkbox from '../../components/ui/controls/forms/checkbox'
import FieldSet from '../../components/ui/controls/forms/field-set'
import { RadioItem, RadioSet } from '../../components/ui/controls/forms/radio-button'
import Select from '../../components/ui/controls/forms/select'
import TextField from '../../components/ui/controls/forms/text-field'
import Form from '../../components/ui/layout/form'
import config from '../../config'

export const Route = createFileRoute('/register/personal-info')({
  component: RouteComponent,
})

type PersonalFormValues = {
  nickname: string
  firstName: string
  lastName: string
  fullNamePermission: boolean
  dateOfBirth: string
  spokenLanguages: readonly string[]
  pronounsSelection: string
  pronounsOther: string
  wheelchair: boolean
}

function RouteComponent() {
  const { data, isLoading } = useRegistrationQuery()
  const { saveDraftRegistration } = useDraftRegistration()
  const navigate = useNavigate()
  const t = useTranslations()

  const { languageOptions, languageOptionsByValue } = useMemo(() => {
    const languageOptions = sortBy(
      prop('label'),
      Object.entries(langMap)
        .filter(([key]) => !(key as string).includes('-') && !(key as string).includes('@'))
        .map(([value, names]) => ({
          label: (names as any).englishName || value,
          value,
        })),
    )

    return {
      languageOptions,
      languageOptionsByValue: new Map(languageOptions.map((l) => [l.value, l])),
    }
  }, [t])

  const personalInfo = data?.registration?.registrationInfo?.personalInfo

  const presetPronouns = ['He/Him', 'She/Her', 'They/Them']
  const defaultPronounsSelection =
    !personalInfo?.pronouns || personalInfo.pronouns === 'prefer-not-to-say'
      ? 'prefer-not-to-say'
      : presetPronouns.includes(personalInfo.pronouns)
        ? personalInfo.pronouns
        : 'other'

  const defaultValues = useMemo<PersonalFormValues>(
    () => ({
      nickname: personalInfo?.nickname ?? '',
      firstName: personalInfo?.firstName ?? '',
      lastName: personalInfo?.lastName ?? '',
      fullNamePermission: personalInfo?.fullNamePermission ?? false,
      dateOfBirth: personalInfo?.dateOfBirth?.toISODate?.() ?? '',
      spokenLanguages: personalInfo?.spokenLanguages ?? [],
      pronounsSelection: defaultPronounsSelection,
      pronounsOther: defaultPronounsSelection === 'other' ? (personalInfo?.pronouns ?? '') : '',
      wheelchair: personalInfo?.wheelchair ?? false,
    }),
    [defaultPronounsSelection, personalInfo],
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<PersonalFormValues>({
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  // Redirect to step 1 if no draft data exists
  useEffect(() => {
    if (!isLoading && !hasDraftRegistrationInfo(data?.registration?.registrationInfo)) {
      navigate({ to: '/register/ticket/type' as any })
    }
  }, [data?.registration?.registrationInfo, isLoading, navigate])

  if (isLoading) {
    return <div>{t('common-loading')}</div>
  }

  if (data?.isOpen === false) {
    return <div>{t('register-not-open-yet-title')}</div>
  }
  const pronounsSelection = watch('pronounsSelection')

  const reAlphaNum = /[\p{Letter}\p{Number}]/gu
  const alphaNumCount = (s: string) => s.match(reAlphaNum)?.length ?? 0
  const reSpace = /[\p{White_Space}]/gu
  const spaceCount = (s: string) => s.match(reSpace)?.length ?? 0

  const onSubmit = (data: any) => {
    addRegistrationBreadcrumb('personal-info', 'submitted', {
      hasNickname: Boolean(data.nickname),
      hasName: Boolean(data.firstName && data.lastName),
      languageCount: data.spokenLanguages?.length || 0,
      pronounsSet: Boolean(data.pronounsSelection),
    })
    saveDraftRegistration((prev) => ({
      ...prev,
      personalInfo: {
        nickname: data.nickname ?? '',
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        fullNamePermission: Boolean(data.fullNamePermission),
        dateOfBirth: DateTime.fromISO(String(data.dateOfBirth ?? ''), { zone: 'Europe/Berlin' }),
        spokenLanguages: data.spokenLanguages || [],
        pronouns:
          data.pronounsSelection === 'prefer-not-to-say'
            ? 'prefer-not-to-say'
            : data.pronounsSelection === 'other'
              ? (data.pronounsOther ?? null)
              : data.pronounsSelection,
        wheelchair: Boolean(data.wheelchair),
      },
    }))

    navigate({ to: '/register/contact' as any })
  }

  return (
    <WithInvoiceRegisterFunnelLayout currentStep={1} onNext={handleSubmit(onSubmit)}>
      <h3>{t('register-personal-info-title')}</h3>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label={t('register-personal-info-nickname.label')}
          placeholder={t('register-personal-info-nickname.placeholder')}
          error={errors.nickname?.message}
          {...register('nickname', {
            required: t('register-personal-info-validation-errors-nickname-required'),
            maxLength: {
              value: 80,
              message: t('register-personal-info-validation-errors-nickname-max-length', {
                limit: 80,
              }),
            },
            validate: {
              noLeadingOrTrailingWhitespace: (v) =>
                v?.trim() === v ||
                t(
                  'register-personal-info-validation-errors-nickname-validate-no-leading-or-trailing-whitespace',
                ),
              minOneAlphanumericChar: (v) =>
                alphaNumCount(v ?? '') > 0 ||
                t(
                  'register-personal-info-validation-errors-nickname-validate-min-one-alphanumeric-char',
                ),
              maxTwoNonAlphanumericChars: (v) =>
                (v?.length ?? 0) - alphaNumCount(v ?? '') - spaceCount(v ?? '') <= 2 ||
                t(
                  'register-personal-info-validation-errors-nickname-validate-max-two-non-alphanumeric-chars',
                ),
            },
          })}
        />

        <TextField
          label={t('register-personal-info-first-name.label')}
          placeholder={t('register-personal-info-first-name.placeholder')}
          gridSpan={5}
          error={errors.firstName?.message}
          {...register('firstName', {
            required: t('register-personal-info-validation-errors-first-name-required'),
            maxLength: {
              value: 80,
              message: t('register-personal-info-validation-errors-first-name-max-length', {
                limit: 80,
              }),
            },
          })}
        />
        <TextField
          label={t('register-personal-info-last-name.label')}
          placeholder={t('register-personal-info-last-name.placeholder')}
          gridSpan={5}
          error={errors.lastName?.message}
          {...register('lastName', {
            required: t('register-personal-info-validation-errors-last-name-required'),
            maxLength: {
              value: 80,
              message: t('register-personal-info-validation-errors-last-name-max-length', {
                limit: 80,
              }),
            },
          })}
        />

        <Checkbox
          label={t('register-personal-info-full-name-permission.label')}
          {...register('fullNamePermission')}
        />

        <TextField
          label={t('register-personal-info-date-of-birth.label')}
          placeholder={t('register-personal-info-date-of-birth.placeholder')}
          type="date"
          error={errors.dateOfBirth?.message}
          {...register('dateOfBirth', {
            required: t('register-personal-info-validation-errors-date-of-birth-required'),
            validate: {
              minimumAge: (v) =>
                DateTime.fromISO(v ?? '', { zone: 'Europe/Berlin' }) <=
                  (config.eventStartDate as any).minus({
                    years: config.minimumAge,
                  }) ||
                t('register-personal-info-validation-errors-date-of-birth-validate-minimum-age'),
              maximumAge: (v) =>
                DateTime.fromISO(v ?? '', { zone: 'Europe/Berlin' }) >=
                  (config.earliestBirthDate as any) ||
                t('register-personal-info-validation-errors-date-of-birth-validate-maximum-age'),
            },
          })}
        />

        <Controller
          control={control}
          name="spokenLanguages"
          rules={{ required: true }}
          render={({ field: { onChange, value, ref, ...field } }) => (
            <Select
              label={t('register-personal-info-spoken-languages.label')}
              isMulti={true}
              options={languageOptions}
              onChange={(langs) => onChange(pluck('value', langs))}
              value={value.map((lang: string) => languageOptionsByValue.get(lang)!)}
              error={errors.spokenLanguages?.message}
              {...field}
            />
          )}
        />

        <RadioSet
          name="pronounsSelection"
          legend={t('register-personal-info-pronouns.legend')}
          error={errors.pronounsSelection?.message}
        >
          <RadioItem
            label={t('register-personal-info-pronouns-prefer-not-to-say.label')}
            value="prefer-not-to-say"
            {...register('pronounsSelection', {
              required: t('register-personal-info-validation-errors-pronouns-selection-required'),
            })}
          />
          <RadioItem
            label="He/Him"
            value="He/Him"
            {...register('pronounsSelection', {
              required: t('register-personal-info-validation-errors-pronouns-selection-required'),
            })}
          />
          <RadioItem
            label="She/Her"
            value="She/Her"
            {...register('pronounsSelection', {
              required: t('register-personal-info-validation-errors-pronouns-selection-required'),
            })}
          />
          <RadioItem
            label="They/Them"
            value="They/Them"
            {...register('pronounsSelection', {
              required: t('register-personal-info-validation-errors-pronouns-selection-required'),
            })}
          />
          <RadioItem
            label={t('register-personal-info-pronouns-other.label')}
            value="other"
            {...register('pronounsSelection', {
              required: t('register-personal-info-validation-errors-pronouns-selection-required'),
            })}
          >
            <TextField
              placeholder="Xe/Xem"
              error={errors.pronounsOther?.message}
              {...register('pronounsOther', {
                required:
                  pronounsSelection === 'other'
                    ? t('register-personal-info-validation-errors-pronouns-other-required')
                    : false,
                maxLength: {
                  value: 40,
                  message: t('register-personal-info-validation-errors-pronouns-other-max-length', {
                    limit: 40,
                  }),
                },
                onChange: () => {
                  // typing here should select the "other" radio
                  setValue('pronounsSelection', 'other', {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                },
              })}
            />
          </RadioItem>
        </RadioSet>

        <FieldSet legend={t('register-personal-info-accessibility.legend')}>
          <Checkbox
            label={t('register-personal-info-accessibility-wheelchair.label')}
            {...register('wheelchair')}
          />
        </FieldSet>
      </Form>
    </WithInvoiceRegisterFunnelLayout>
  )
}
