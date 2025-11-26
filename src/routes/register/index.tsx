import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslations } from '~/localization'
import { useRegistrationQuery } from '~/registration/hooks'

export const Route = createFileRoute('/register/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data, isLoading } = useRegistrationQuery()
  const t = useTranslations()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (data?.isOpen === false) {
      navigate({ to: '/register/not-open-yet' as any })
      return
    }

    // If user already has a registration, redirect to summary
    if (
      data?.registration &&
      'id' in data.registration &&
      typeof data.registration.id === 'number'
    ) {
      navigate({ to: '/register/summary' as any })
      return
    }

    navigate({ to: '/register/ticket/type' as any })
  }, [data, isLoading, navigate])

  return <div>{t('common-loading')}</div>
}
