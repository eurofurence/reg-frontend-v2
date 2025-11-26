import styled from '@emotion/styled'
import type { ReactNode } from 'react'
import { useEurofurenceDates } from '~/hooks/useEurofurenceDates'
import ErrorBoundary from '../ErrorBoundary'
import Footer from './Footer'
import Header from './Header'
import LoginGuard from './LoginGuard'

const Main = styled.main`
  min-height: calc(100vh - 220px);
  padding: 2rem 1rem 4rem;
  background: var(--color-grays-050);
`

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { dates } = useEurofurenceDates()

  return (
    <>
      <Header deadline={dates.registrationLaunch} />
      <ErrorBoundary>
        <LoginGuard>
          <Main>{children}</Main>
        </LoginGuard>
      </ErrorBoundary>
      <Footer />
    </>
  )
}

export default AppLayout
