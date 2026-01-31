import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import WithInvoiceRegisterFunnelLayout from '~/components/funnels/WithInvoiceRegisterFunnelLayout'
import Checkbox from '~/components/ui/controls/forms/checkbox'
import FieldSet from '~/components/ui/controls/forms/field-set'
import TextArea from '~/components/ui/controls/forms/text-area'
import Form from '~/components/ui/layout/form'
import { useTranslations } from '~/localization'
import { hasDraftRegistrationInfo } from '~/registration/autosave'
import { useDraftRegistration, useRegistrationQuery } from '~/registration/hooks'

type OptionalFormValues = {
  notifications: {
    art: boolean
    animation: boolean
    music: boolean
    fursuiting: boolean
  }
  digitalConbook: boolean
  comments: string
}

export const Route = createFileRoute('/register/optional')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading } = useRegistrationQuery()
  const { saveDraftRegistration } = useDraftRegistration()
  const navigate = useNavigate()
  const t = useTranslations()

  const optionalInfo = data?.registration?.registrationInfo?.optionalInfo

  const defaultValues = useMemo<OptionalFormValues>(
    () => ({
      notifications: {
        art: optionalInfo?.notifications.art ?? false,
        animation: optionalInfo?.notifications.animation ?? false,
        music: optionalInfo?.notifications.music ?? false,
        fursuiting: optionalInfo?.notifications.fursuiting ?? false,
      },
      digitalConbook: optionalInfo?.digitalConbook ?? false,
      comments: optionalInfo?.comments ?? '',
    }),
    [optionalInfo],
  )

  const { register, handleSubmit, reset } = useForm<OptionalFormValues>({
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  // Redirect to step 1 if no draft data exists
  useEffect(() => {
    if (!isLoading && !hasDraftRegistrationInfo(data?.registration?.registrationInfo)) {
      navigate({ href: '/register/ticket/type' })
    }
  }, [isLoading, navigate, data?.registration?.registrationInfo])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (data?.isOpen === false) {
    return <div>Registration is not open yet.</div>
  }

  const onSubmit = (values: OptionalFormValues) => {
    saveDraftRegistration((prev) => ({
      ...prev,
      optionalInfo: {
        notifications: {
          art: values.notifications.art,
          animation: values.notifications.animation,
          music: values.notifications.music,
          fursuiting: values.notifications.fursuiting,
        },
        digitalConbook: values.digitalConbook,
        comments: values.comments.trim() === '' ? null : values.comments.trim(),
      },
    }))

    navigate({ href: '/register/summary' })
  }

  return (
    <WithInvoiceRegisterFunnelLayout currentStep={4} onNext={handleSubmit(onSubmit)}>
      <h3>{t('register-optional-info-title')}</h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FieldSet legend={t('register-optional-info-notifications.legend')}>
          <Checkbox
            label={t('register-optional-info-notifications-art.label')}
            {...register('notifications.art')}
          />
          <Checkbox
            label={t('register-optional-info-notifications-animation.label')}
            {...register('notifications.animation')}
          />
          <Checkbox
            label={t('register-optional-info-notifications-music.label')}
            {...register('notifications.music')}
          />
          <Checkbox
            label={t('register-optional-info-notifications-fursuiting.label')}
            {...register('notifications.fursuiting')}
          />
        </FieldSet>

        <FieldSet legend={t('register-optional-info-conbook.legend')}>
          <Checkbox
            label={t('register-optional-info-conbook-digital-only.label')}
            {...register('digitalConbook')}
          />
        </FieldSet>

        <TextArea
          label={t('register-optional-info-comments.label')}
          placeholder={t('register-optional-info-comments.placeholder')}
          {...register('comments')}
        />
      </Form>
    </WithInvoiceRegisterFunnelLayout>
  )
}
