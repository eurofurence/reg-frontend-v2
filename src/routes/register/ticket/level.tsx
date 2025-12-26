import styled from '@emotion/styled'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { RadioGroup, TicketLevelAddon, TicketLevelCard, TicketLevelFootnote } from '~/components'
import { useTranslations } from '~/localization'
import { useDraftRegistration, useRegistrationQuery } from '~/registration/hooks'
import type { TicketLevelAddons } from '~/registration/types'
import FullWidthRegisterFunnelLayout from '../../../components/funnels/FullWidthRegisterFunnelLayout'
import config from '../../../config'

const TicketLevelGrid = styled.section`
  display: grid;
  gap: 10px;
  margin-top: 1.5em;

  @media not all and (min-width: 1150px) {
    grid: auto-flow auto / 1fr;
  }

  @media (min-width: 1150px) {
    grid: auto-flow 1fr / repeat(4, 1fr);
  }
`

const ModifiersSection = styled.section`
  margin-top: 1em;
`

const AddonsSection = styled.section`
  margin-top: 4.5em;
`

const AddonsContainer = styled.section`
  margin-top: 3em;
`

export const Route = createFileRoute('/register/ticket/level')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading } = useRegistrationQuery()
  const { saveDraftRegistration } = useDraftRegistration()
  const navigate = useNavigate()
  const t = useTranslations()

  const registrationInfo = data?.registration?.registrationInfo
  const ticketType = registrationInfo?.ticketType

  // Convert config.ticketLevels object to array format for compatibility
  const ticketLevels = Object.entries(config.ticketLevels).map(([id, level]) => ({
    id,
    ...level,
  }))

  type TicketLevelId = keyof typeof config.ticketLevels
  const isTicketLevelId = (value: unknown): value is TicketLevelId =>
    value !== null && typeof value === 'string' && value in config.ticketLevels
  const resolvedLevel: TicketLevelId =
    registrationInfo && isTicketLevelId(registrationInfo.ticketLevel?.level)
      ? (registrationInfo.ticketLevel!.level as TicketLevelId)
      : 'standard'

  const defaultLevel = resolvedLevel

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<{
    level: TicketLevelId
    addons: Record<string, { selected?: boolean; options?: Record<string, string> }>
  }>({
    defaultValues: {
      level: defaultLevel,
      addons: registrationInfo?.ticketLevel?.addons ?? {},
    },
  })

  const watchedLevel = watch('level')
  const watchedAddons = watch('addons')
  const [previousLevel, setPreviousLevel] = useState<TicketLevelId | null>(null)

  // Set initial form value
  useEffect(() => {
    setValue('level', defaultLevel)
  }, [defaultLevel, setValue])

  // Autosave when form values change
  useEffect(() => {
    const subscription = watch((formData) => {
      if (formData.level) {
        saveDraftRegistration((prev) => ({
          ...prev,
          ticketLevel: {
            level: formData.level as keyof typeof config.ticketLevels,
            addons: formData.addons as TicketLevelAddons,
          },
        }))
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, saveDraftRegistration])

  // Validate addon options when they change
  useEffect(() => {
    const subscription = watch((formData) => {
      // Validate t-shirt size when t-shirt is selected
      if (formData.addons?.tshirt?.selected) {
        if (!formData.addons.tshirt.options?.size) {
          setError('addons.tshirt.options.size', {
            type: 'required',
            message: 'T-shirt size is required',
          })
        } else {
          clearErrors('addons.tshirt.options.size')
        }
      } else {
        clearErrors('addons.tshirt.options.size')
      }

      // Validate benefactor count when benefactor is selected
      if (formData.addons?.benefactor?.selected) {
        if (!formData.addons.benefactor.options?.count) {
          setError('addons.benefactor.options.count', {
            type: 'required',
            message: 'Benefactor count is required',
          })
        } else {
          clearErrors('addons.benefactor.options.count')
        }
      } else {
        clearErrors('addons.benefactor.options.count')
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, setError, clearErrors])

  // Set initial addon values
  useEffect(() => {
    if (registrationInfo?.ticketLevel?.addons) {
      Object.entries(registrationInfo.ticketLevel.addons).forEach(([addonId, addonData]) => {
        setValue(`addons.${addonId}.selected`, addonData.selected ?? false)
        if (addonData.options) {
          Object.entries(addonData.options).forEach(([optionId, value]) => {
            setValue(`addons.${addonId}.options.${optionId}`, value)
          })
        }
      })
    }
  }, [registrationInfo?.ticketLevel?.addons, setValue])

  // Reset addons when level changes
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'level' && type === 'change') {
        const levelValue = value.level as TicketLevelId

        if (levelValue !== null && levelValue !== previousLevel) {
          // Only reset addons when level actually changes
          Object.entries(config.addons)
            .filter(([, addon]) => addon.resetOn?.levelChange ?? false)
            .forEach(([addonId]) => {
              const isIncluded =
                config.ticketLevels[levelValue]?.includes?.includes(
                  addonId as keyof typeof config.addons,
                ) ?? false
              const isRequired =
                config.ticketLevels[levelValue]?.requires?.includes(
                  addonId as keyof typeof config.addons,
                ) ?? false
              const addonConfig = config.addons[addonId as keyof typeof config.addons]
              const isUnavailable = addonConfig.unavailableFor?.level?.includes(levelValue) ?? false
              const isUnavailableForType =
                addonConfig.unavailableFor?.type?.includes(ticketType?.type ?? 'full') ?? false

              const shouldDefault =
                ((isIncluded || isRequired) && !isUnavailable && !isUnavailableForType) ||
                (!isUnavailableForType && addonConfig.default)

              setValue(`addons.${addonId}.selected`, shouldDefault)
            })
          setPreviousLevel(levelValue)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, setValue, previousLevel, ticketType?.type])

  // Redirect to appropriate step based on ticket type
  useEffect(() => {
    if (!isLoading) {
      if (!registrationInfo?.ticketType) {
        // No ticket type selected, go to type selection
        navigate({ to: '/register/ticket/type' as any })
      } else if (registrationInfo.ticketType.type === 'day' && !registrationInfo.ticketType.day) {
        // Day ticket but no day selected, go to day selection
        navigate({ to: '/register/ticket/day' as any })
      }
      // If ticketType is 'full' or ('day' with day selected), stay on level page
    }
  }, [isLoading, registrationInfo?.ticketType, navigate])

  if (isLoading) {
    return <div>{t('common-loading')}</div>
  }

  if (data?.isOpen === false) {
    return <div>{t('register-not-open-yet-title')}</div>
  }

  if (!registrationInfo) {
    return null
  }

  const onSubmit = (formData: {
    level: TicketLevelId
    addons: Record<string, { selected?: boolean; options?: Record<string, string> }>
  }) => {
    // Check for validation errors before proceeding
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors) {
      return
    }

    saveDraftRegistration((prev) => ({
      ...prev,
      ticketLevel: {
        level: formData.level,
        addons: formData.addons as TicketLevelAddons,
      },
    }))
    navigate({ to: '/register/personal-info' as any })
  }

  const handleAddonChange = (addonId: keyof typeof config.addons, selected: boolean) => {
    setValue(`addons.${String(addonId)}.selected`, selected)
  }

  const handleAddonOptionChange = (
    addonId: keyof typeof config.addons,
    optionId: string,
    value: string | undefined,
  ) => {
    setValue(`addons.${String(addonId)}.options.${optionId}`, value || '')
  }

  const handleNext = handleSubmit(onSubmit)

  return (
    <FullWidthRegisterFunnelLayout currentStep={2} onNext={handleNext} showBack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <section>
          <h3>{t('register-ticket-level-title')}</h3>
          <TicketLevelGrid>
            <RadioGroup name="level">
              {ticketLevels.map((level) => {
                const levelKey = `register-ticket-level-card-${level.id}` as const

                return (
                  <TicketLevelCard
                    key={level.id}
                    id={level.id}
                    price={level.prices[ticketType?.type ?? 'full']}
                    label={t(`${levelKey}.label`)}
                    priceLabel={t(`${levelKey}.priceLabel`, {
                      type: ticketType?.type ?? 'full',
                    })}
                    footnoteMarker={ticketType?.type !== 'day' ? '*' : ''}
                    checked={watchedLevel === level.id}
                    {...register('level', { required: true })}
                  >
                    {t(`${levelKey}.value`)}
                  </TicketLevelCard>
                )
              })}
            </RadioGroup>
          </TicketLevelGrid>
        </section>
        {ticketType?.type !== 'day' ? (
          <ModifiersSection>
            <TicketLevelFootnote
              marker="*"
              label={t('register-ticket-level-modifiers-early-bird.label')}
              price={t('register-ticket-level-modifiers-early-bird.price')}
            />
            <TicketLevelFootnote
              marker=""
              label={t('register-ticket-level-modifiers-late-fee.label')}
              price={t('register-ticket-level-modifiers-late-fee.price')}
            />
            <TicketLevelFootnote
              marker="**"
              label={t('register-ticket-level-footnote-late-sponsors.label')}
              price=""
            />
          </ModifiersSection>
        ) : (
          <ModifiersSection>
            <TicketLevelFootnote
              marker="**"
              label={t('register-ticket-level-footnote-late-sponsors.label')}
              price=""
            />
          </ModifiersSection>
        )}
        <AddonsSection>
          <h3>{t('register-ticket-level-addons-title')}</h3>
          <AddonsContainer>
            {(() => {
              const addonIds = Object.keys(config.addons) as Array<keyof typeof config.addons>
              const visibleAddons = addonIds.filter((addonId) => {
                const addon = config.addons[addonId]
                const isUnavailable = addon.unavailable ?? false
                const isUnavailableForType =
                  addon.unavailableFor?.type?.includes(ticketType?.type ?? 'full') ?? false
                const isUnavailableForLevel =
                  addon.unavailableFor?.level?.includes(
                    watchedLevel as keyof typeof config.ticketLevels,
                  ) ?? false

                // Don't show hidden addons
                if (addon.hidden) return false

                // Don't show if unavailable for this ticket type or level
                if (isUnavailableForType || isUnavailableForLevel || isUnavailable) return false

                // Check requirements
                if (addon.requires && addon.requires.length > 0) {
                  const missingRequirements = addon.requires.filter(
                    (reqId) => !watchedAddons[reqId]?.selected,
                  )
                  if (missingRequirements.length > 0) return false
                }

                return true
              })

              if (visibleAddons.length === 0) {
                return (
                  <div
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: 'var(--color-grays-500)',
                      fontStyle: 'italic',
                    }}
                  >
                    {t('register-ticket-level-addons-none-available')}
                  </div>
                )
              }

              return visibleAddons.map((addonId) => (
                <TicketLevelAddon
                  key={addonId}
                  addonId={addonId}
                  selectedLevel={watchedLevel}
                  ticketType={ticketType?.type ?? 'full'}
                  selectedAddons={watchedAddons}
                  onAddonChange={handleAddonChange}
                  onAddonOptionChange={handleAddonOptionChange}
                  errors={errors}
                />
              ))
            })()}
          </AddonsContainer>
        </AddonsSection>
      </form>
    </FullWidthRegisterFunnelLayout>
  )
}
