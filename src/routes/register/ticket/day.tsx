import styled from '@emotion/styled'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DateTime, Interval } from 'luxon'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { RadioCard, RadioGroup } from '~/components'
import config from '~/config'
import { useTranslations } from '~/localization'
import { useDraftRegistration, useRegistrationQuery } from '~/registration/hooks'
import { eachDayOfInterval } from '~/util/dates'
import FullWidthRegisterFunnelLayout from '../../../components/funnels/FullWidthRegisterFunnelLayout'
import fridayImage from '../../../images/con-cats/days/friday.png'
import mondayImage from '../../../images/con-cats/days/monday.png'
import saturdayImage from '../../../images/con-cats/days/saturday.png'
import sundayImage from '../../../images/con-cats/days/sunday.png'
import thursdayImage from '../../../images/con-cats/days/thursday.png'
import tuesdayImage from '../../../images/con-cats/days/tuesday.png'
import wednesdayImage from '../../../images/con-cats/days/wednesday.png'

const Grid = styled.div`
  display: grid;
  gap: 20px;

  @media (max-width: 649.99px) {
    grid: auto-flow 1fr / 1fr;
  }

  @media (min-width: 650px) and (max-width: 799.99px) {
    grid: auto-flow 1fr / repeat(2, 1fr);
  }

  @media (min-width: 800px) {
    grid: auto-flow 1fr / repeat(3, 1fr);
  }
`

const ConCat = styled.figure`
  position: relative;
`

const dayImages: Record<number, string> = {
  1: mondayImage,
  2: tuesdayImage,
  3: wednesdayImage,
  4: thursdayImage,
  5: fridayImage,
  6: saturdayImage,
  7: sundayImage,
}

export const Route = createFileRoute('/register/ticket/day')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading } = useRegistrationQuery()
  const { saveDraftRegistration } = useDraftRegistration()
  const navigate = useNavigate()
  const t = useTranslations()

  const days = eachDayOfInterval(
    Interval.fromDateTimes(config.dayTicketStartDate, config.dayTicketEndDate),
  )

  const registrationInfo = data?.registration?.registrationInfo

  // Redirect to appropriate step based on ticket type
  useEffect(() => {
    if (!isLoading) {
      if (!registrationInfo?.ticketType) {
        // No ticket type selected, go to type selection
        navigate({ href: '/register/ticket/type' })
      } else if (registrationInfo.ticketType.type !== 'day') {
        // Not a day ticket, go to type selection
        navigate({ href: '/register/ticket/type' })
      }
      // If ticketType is 'day', stay on day page
    }
  }, [isLoading, registrationInfo?.ticketType, navigate])

  const defaultDay = useMemo(
    () =>
      registrationInfo?.ticketType?.type === 'day'
        ? (registrationInfo.ticketType.day?.toISODate?.() ?? '')
        : '',
    [registrationInfo?.ticketType],
  )

  const { register, handleSubmit, reset, watch } = useForm<{ day: string }>({
    defaultValues: { day: defaultDay },
  })

  useEffect(() => {
    reset({ day: defaultDay })
  }, [defaultDay, reset])

  // Autosave when form values change
  useEffect(() => {
    const subscription = watch((formData) => {
      if (formData.day) {
        saveDraftRegistration((prev) => ({
          ...prev,
          ticketType: {
            type: 'day',
            day: DateTime.fromISO(formData.day!, { zone: 'Europe/Berlin' }),
          },
        }))
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, saveDraftRegistration])

  if (isLoading) {
    return <div>{t('common-loading')}</div>
  }

  if (data?.isOpen === false) {
    return <div>{t('register-not-open-yet-title')}</div>
  }

  if (!registrationInfo) {
    return null
  }

  const onSubmit = (formData: { day: string }) => {
    saveDraftRegistration((prev) => ({
      ...prev,
      ticketType: {
        type: 'day',
        day: DateTime.fromISO(formData.day, { zone: 'Europe/Berlin' }),
      },
    }))
    navigate({ href: '/register/ticket/level' })
  }

  const handleNext = handleSubmit(onSubmit)

  return (
    <FullWidthRegisterFunnelLayout currentStep={1} onNext={handleNext} showBack>
      <h3>{t('register-ticket-day-title')}</h3>
      <form id="ticket-day-form">
        <RadioGroup name="day">
          <Grid>
            {days.map((day) => {
              const value = day.toISODate()!
              const label = t('register-ticket-day-card.label', { date: day })

              return (
                <RadioCard
                  key={value}
                  label={label}
                  value={value}
                  {...register('day', { required: true })}
                >
                  <ConCat>
                    <img src={dayImages[day.weekday]} alt="" />
                  </ConCat>
                </RadioCard>
              )
            })}
          </Grid>
        </RadioGroup>
      </form>
    </FullWidthRegisterFunnelLayout>
  )
}
