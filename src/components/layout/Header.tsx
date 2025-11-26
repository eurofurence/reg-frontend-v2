import styled from '@emotion/styled'
import { Link } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { useEffect, useMemo, useState } from 'react'
import {
  Display,
  NavBar,
  NavBarCenter,
  NavBarMenu,
  NavBarMenuItem,
  NavBarSubMenu,
  NavBarTitle,
} from '~/components'
import brandImage from '~/components/ui/assets/brand.svg'
import config from '~/config'
import globeIcon from '~/images/globe.svg'
import userIcon from '~/images/user.svg'
import { supportedLocales, useLocaleControls, useTranslations } from '~/localization'

const BrandLink = styled(Link)`
  display: flex;
  gap: 1ch;
  align-items: center;
`

const BrandImage = styled.img`
  height: 36px;
`

const ClockContainer = styled.div`
  display: flex;
  gap: 1rem;
`

interface Countdown {
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

const useCountdown = (deadline?: DateTime) => {
  deadline = DateTime.fromISO('2026-01-15T20:00:00+00:00')
  const calculate = () => {
    if (!deadline) {
      return null
    }

    // If deadline is in the past, don't show countdown
    if (deadline <= DateTime.now()) {
      return null
    }

    const duration = deadline.diffNow(['months', 'days', 'hours', 'minutes', 'seconds']).toObject()
    return {
      months: Math.max(0, Math.floor(duration.months ?? 0)),
      days: Math.max(0, Math.floor(duration.days ?? 0)),
      hours: Math.max(0, Math.floor(duration.hours ?? 0)),
      minutes: Math.max(0, Math.floor(duration.minutes ?? 0)),
      seconds: Math.max(0, Math.floor(duration.seconds ?? 0)),
    }
  }

  const [countdown, setCountdown] = useState<Countdown | null>(calculate)

  useEffect(() => {
    if (!deadline) {
      return undefined
    }

    const id = setInterval(() => {
      setCountdown(calculate())
    }, 1000)

    return () => clearInterval(id)
  }, [deadline])

  return countdown
}

interface HeaderProps {
  deadline?: DateTime
}

const Header = ({ deadline }: HeaderProps) => {
  const countdown = useCountdown(deadline)
  const t = useTranslations()
  const { setLocale } = useLocaleControls()

  const languages = useMemo(() => {
    const languageNames: Record<string, string> = {
      'en-US': 'English',
      'de-DE': 'German',
    }
    return supportedLocales.map((code) => ({
      locale: code,
      label: languageNames[code] ?? code,
    }))
  }, [])

  return (
    <NavBar>
      <NavBarTitle>
        <BrandLink to="/register">
          <BrandImage src={brandImage} alt={config.eventName} />
          {config.eventName}
        </BrandLink>
      </NavBarTitle>
      {countdown ? (
        <NavBarCenter>
          <ClockContainer>
            <Display
              caption={t('header-clock-component-months.caption')}
              content={countdown.months.toString()}
              size={2}
              padding="0"
            />
            <Display
              caption={t('header-clock-component-days.caption')}
              content={countdown.days.toString()}
              size={2}
              padding="0"
            />
            <Display
              caption={t('header-clock-component-hours.caption')}
              content={countdown.hours.toString()}
              size={2}
              padding="0"
            />
            <Display
              caption={t('header-clock-component-minutes.caption')}
              content={countdown.minutes.toString()}
              size={2}
              padding="0"
            />
            <Display
              caption={t('header-clock-component-seconds.caption')}
              content={countdown.seconds.toString()}
              size={2}
              padding="0"
            />
          </ClockContainer>
        </NavBarCenter>
      ) : null}
      <NavBarMenu>
        <NavBarMenuItem
          icon={userIcon}
          label={t('header-menu-item-my-account.label')}
          href="https://identity.eurofurence.org/dashboard"
        />
        <NavBarSubMenu icon={globeIcon} label={t('header-menu-item-language.label')}>
          {languages.map(({ locale: localeCode, label }) => (
            <NavBarMenuItem
              key={localeCode}
              label={label}
              onClick={(e) => {
                e.preventDefault()
                setLocale(localeCode)
              }}
            />
          ))}
        </NavBarSubMenu>
      </NavBarMenu>
    </NavBar>
  )
}

export default Header
