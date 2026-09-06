import styled from '@emotion/styled'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { DateTime } from 'luxon'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { RadioCard, RadioGroup } from '~/components'
import { useEurofurenceDates } from '~/hooks/useEurofurenceDates'
import { useTranslations } from '~/localization'
import { determineDefaultAddons } from '~/registration/addons'
import { useDraftRegistration, useRegistrationQuery } from '~/registration/hooks'
import type { RegistrationInfo } from '~/registration/types'
import { addRegistrationBreadcrumb } from '~/util/sentry'
import FullWidthRegisterFunnelLayout from '../../../components/funnels/FullWidthRegisterFunnelLayout'
import dayTicketImage from '../../../images/con-cats/ticket-types/day.png'
import fullTicketImage from '../../../images/con-cats/ticket-types/full.png'

const TicketTypeGrid = styled.div`
  display: grid;
  gap: 20px;

  @media not all and (min-width: 600px) {
    grid: auto-flow auto / 1fr;
  }

  @media (min-width: 600px) {
    grid: auto-flow 1fr / 1fr 1fr;
  }
`

const ConCat = styled.figure`
  position: relative;
`

// The other type has different hidden packages and defaults, so the level starts over. This also
// runs on autosave, so by the time the page is submitted the draft usually holds the new type already.
const withTicketType = (
  prev: Partial<RegistrationInfo>,
  type: 'full' | 'day',
  conventionStart: DateTime,
): Partial<RegistrationInfo> => ({
  ...prev,
  ...(prev.ticketLevel && prev.ticketType?.type !== type
    ? { ticketLevel: { level: null, addons: determineDefaultAddons(type) } }
    : {}),
  ticketType:
    type === 'day'
      ? {
          type: 'day',
          day: prev.ticketType?.type === 'day' ? prev.ticketType.day : conventionStart,
        }
      : { type: 'full' },
})

export const Route = createFileRoute('/register/ticket/type')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading } = useRegistrationQuery()
  const { saveDraftRegistration } = useDraftRegistration()
  const navigate = useNavigate()
  const t = useTranslations()
  const { dates } = useEurofurenceDates()

  const registrationInfo = data?.registration?.registrationInfo
  const currentTicketType = registrationInfo?.ticketType

  const defaultType = currentTicketType?.type === 'day' ? 'day' : 'full'
  const defaultValues = useMemo(() => ({ type: defaultType as 'full' | 'day' }), [defaultType])

  const { register, handleSubmit, reset, watch } = useForm<{ type: 'full' | 'day' }>({
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  // Autosave when form values change
  useEffect(() => {
    const subscription = watch((formData) => {
      if (formData.type === 'full' || formData.type === 'day') {
        const type = formData.type
        saveDraftRegistration((prev) => withTicketType(prev, type, dates.conventionStart))
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, saveDraftRegistration, dates.conventionStart])

  if (isLoading) {
    return <div>{t('common-loading')}</div>
  }

  if (data?.isOpen === false) {
    return <div>{t('register-not-open-yet-title')}</div>
  }

  const onSubmit = (formData: { type: 'full' | 'day' }) => {
    addRegistrationBreadcrumb('ticket-type', 'selected', { ticketType: formData.type })
    saveDraftRegistration((prev) => withTicketType(prev, formData.type, dates.conventionStart))

    if (formData.type === 'day') {
      navigate({ href: '/register/ticket/day' })
    } else {
      navigate({ href: '/register/ticket/level' })
    }
  }

  const handleNext = handleSubmit(onSubmit)

  return (
    <FullWidthRegisterFunnelLayout currentStep={0} onNext={handleNext}>
      <h3>{t('register-ticket-type-title')}</h3>
      <form id="ticket-type-form">
        <RadioGroup name="type">
          <TicketTypeGrid>
            <RadioCard
              label={t('register-ticket-type-full.label')}
              value="full"
              {...register('type', { required: true })}
            >
              <ConCat>
                <img src={fullTicketImage} alt="" />
              </ConCat>
            </RadioCard>

            <RadioCard
              label={t('register-ticket-type-day.label')}
              value="day"
              {...register('type', { required: true })}
            >
              <ConCat>
                <img src={dayTicketImage} alt="" />
              </ConCat>
            </RadioCard>
          </TicketTypeGrid>
        </RadioGroup>
      </form>
    </FullWidthRegisterFunnelLayout>
  )
}
