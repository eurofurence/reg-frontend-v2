import { captureException } from '@sentry/react'
import type { ReactNode } from 'react'
import { startLoginRedirect, useUserInfoQuery } from '~/apis/authsrv'
import { LoginRequiredError } from '~/apis/common'
import { Button, Splash } from '~/components'
import dayTicketImage from '~/images/con-cats/ticket-types/day.png'
import { useTranslations } from '~/localization'

interface LoginGuardProps {
  children: ReactNode
}

const LoginGuard = ({ children }: LoginGuardProps) => {
  const t = useTranslations()
  const { data, error, status, refetch, isFetching } = useUserInfoQuery()

  if (status === 'pending' || isFetching) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>
  }

  if (error instanceof LoginRequiredError) {
    return (
      <Splash image={<img src={dayTicketImage} alt="" loading="lazy" />}>
        <h1>{t('auth-login-required-title')}</h1>
        <p>{t('auth-login-required-message')}</p>
        <Button onClick={() => startLoginRedirect()}>{t('auth-login-required-button')}</Button>
      </Splash>
    )
  }

  if (error) {
    captureException(error, {
      level: 'error',
      tags: { flow: 'auth', step: 'user-info-query' },
      extra: {
        reason: 'Failed to load user information',
      },
    })

    return (
      <Splash image={<img src={dayTicketImage} alt="" loading="lazy" />}>
        <h1>{t('funnel-error-report-title')}</h1>
        <p>{error.message}</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </Splash>
    )
  }

  if (!data) {
    return null
  }

  if (!data.emailVerified) {
    return (
      <Splash image={<img src={dayTicketImage} alt="" loading="lazy" />}>
        <h1>{t('auth-unverified-title')}</h1>
        <p>{t('auth-unverified-message')}</p>
        <Button onClick={() => startLoginRedirect()}>{t('auth-unverified-retry')}</Button>
      </Splash>
    )
  }

  return <>{children}</>
}

export default LoginGuard
