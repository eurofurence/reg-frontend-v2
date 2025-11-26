import { range } from 'ramda'
import { WizardProgressBar } from '~/components'
import Markdown from '~/components/Markdown'
import { useTranslations } from '~/localization'
import { useRegistrationQuery } from '~/registration/hooks'
import { TOTAL_STEPS } from './constants'

interface RegisterHeaderProps {
  readonly currentStep: number
}

const RegisterHeader = ({ currentStep }: RegisterHeaderProps) => {
  const { data } = useRegistrationQuery()
  const t = useTranslations()

  const isEdit =
    data?.registration?.status !== undefined && data.registration.status !== 'unsubmitted'

  if (isEdit) {
    return null
  }

  const steps = range(1, TOTAL_STEPS + 1).map((step) => t('register-step-counter', { step }))

  return (
    <>
      {currentStep === 0 ? (
        <div style={{ marginBottom: '1em' }}>
          <h1 style={{ marginBottom: '0.5em' }}>{t('register-header-title')}</h1>
          <Markdown>{t('register-header-description')}</Markdown>
        </div>
      ) : null}
      <WizardProgressBar currentStep={currentStep} steps={steps} />
    </>
  )
}

export default RegisterHeader
