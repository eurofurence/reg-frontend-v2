import styled from '@emotion/styled'
import type { ReactNode } from 'react'
import Button from '~/components/ui/controls/button'
import Page from '~/components/ui/layout/page'
import * as MediaQueries from '~/components/ui/media-queries'
import { useTranslations } from '~/localization'
import { useRegistrationQuery } from '~/registration/hooks'
import { TOTAL_STEPS } from './constants'
import RegisterHeader from './RegisterHeader'

const Header = styled.header`
  margin-bottom: 3em;
`

const Footer = styled.footer`
  margin-top: 3.5em;
  margin-bottom: 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Nav = styled.nav`
  display: flex;
  gap: 1em;

  @media not all and ${MediaQueries.phone} {
    align-items: center;
  }

  @media ${MediaQueries.phone} {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`

export interface FullWidthRegisterFunnelLayoutProps {
  readonly children: ReactNode
  readonly currentStep: number
  readonly onNext?: () => void
  readonly showBack?: boolean
  readonly hideNavigation?: boolean
  readonly onBack?: () => void
}

const useIsEditMode = () => {
  const { data } = useRegistrationQuery()

  return data?.registration?.status !== undefined && data.registration.status !== 'unsubmitted'
}

const FullWidthRegisterFunnelLayout = ({
  children,
  currentStep,
  onNext,
  showBack = false,
  hideNavigation = false,
  onBack,
}: FullWidthRegisterFunnelLayoutProps) => {
  const isEdit = useIsEditMode()
  const t = useTranslations()

  const isFirstPage = currentStep === 0
  const isLastPage = currentStep >= TOTAL_STEPS - 1
  const shouldRenderNavigation = Boolean(onNext) && !hideNavigation

  const nextLabelKey = isEdit
    ? 'register-navigation-update'
    : isLastPage
      ? 'register-navigation-finish'
      : 'register-navigation-next'

  return (
    <Page>
      <Header>
        <RegisterHeader currentStep={currentStep} />
      </Header>

      {children}

      {shouldRenderNavigation && (!isEdit || !isLastPage) ? (
        <Footer>
          <Nav>
            <Button onClick={onNext}>{t(nextLabelKey)}</Button>
            {isFirstPage && !showBack ? null : (
              <Button
                type="button"
                variant="inverted"
                onClick={() => (onBack ? onBack() : window.history.back())}
              >
                {t('register-navigation-back')}
              </Button>
            )}
          </Nav>
        </Footer>
      ) : null}
    </Page>
  )
}

export default FullWidthRegisterFunnelLayout
