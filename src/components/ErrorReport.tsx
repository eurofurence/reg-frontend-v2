import { useState } from 'react'
import { Button, Splash, TextArea } from '~/components'
import Markdown from '~/components/Markdown'
import dayTicketImage from '~/images/con-cats/ticket-types/day.png'
import { useTranslations } from '~/localization'

interface ErrorReportProps {
  operation?: string
  category?: string
  code?: string
  message?: string
  details?: string
  onRetry?: () => void
}

const ErrorReport = ({
  operation = 'unknown',
  category = 'frontend',
  code = 'unknown',
  message,
  details,
  onRetry,
}: ErrorReportProps) => {
  const t = useTranslations()
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Splash image={<img src={dayTicketImage} alt="" loading="lazy" />}>
      <h1>{t('funnel-error-report-title')}</h1>
      <h2>{t('funnel-error-report-operation', { operation })}</h2>
      <Markdown>{t('funnel-error-report-message', { category, code })}</Markdown>

      {message ? <p style={{ fontStyle: 'italic' }}>{message}</p> : null}

      {details ? (
        <section style={{ marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-brand-2-400)',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginBottom: '0.75rem',
            }}
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
          {showDetails ? (
            <div style={{ minHeight: 160 }}>
              <TextArea name="error-details" placeholder="" readOnly value={details} />
            </div>
          ) : null}
        </section>
      ) : null}

      {onRetry ? (
        <Button onClick={onRetry} style={{ marginTop: '2rem' }}>
          {t('funnel-error-report-back')}
        </Button>
      ) : null}
    </Splash>
  )
}

export default ErrorReport
