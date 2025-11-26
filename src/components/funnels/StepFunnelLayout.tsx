/*
 * A layout that's common to all funnel step pages.
 * Features a header that can be passed as the `headerContent` prop and a footer showing navigation buttons,
 * of which the "back" button will be invisible if `isFirstPage` is true.
 */

import styled from '@emotion/styled'
import type { ReactNode } from 'react'
import Button from '~/components/ui/controls/button'
import Page from '~/components/ui/layout/page'
import * as MediaQueries from '~/components/ui/media-queries'
import { useTranslations } from '~/localization'

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

export interface StepFunnelLayoutProps {
  readonly children: ReactNode
  readonly header?: ReactNode
  readonly isFirstPage?: boolean
  readonly isLastPage?: boolean
  readonly isEditMode?: boolean
  readonly onNext?: () => void
  readonly showBack?: boolean
}

const StepFunnelLayout = ({
  children,
  header: headerContent,
  isFirstPage = false,
  isLastPage = false,
  isEditMode = false,
  onNext,
  showBack = false,
}: StepFunnelLayoutProps) => {
  const t = useTranslations()

  return (
    <Page>
      <Header>{headerContent}</Header>
      {children}
      {(isEditMode && isLastPage) || !onNext ? null : (
        <Footer>
          <Nav>
            <Button onClick={onNext}>
              {isEditMode
                ? t('register-navigation-update')
                : isLastPage
                  ? t('register-navigation-finish')
                  : t('register-navigation-next')}
            </Button>
            {isFirstPage && !showBack ? null : (
              <Button variant="inverted" onClick={() => window.history.back()}>
                {t('register-navigation-back')}
              </Button>
            )}
          </Nav>
        </Footer>
      )}
    </Page>
  )
}

export default StepFunnelLayout
