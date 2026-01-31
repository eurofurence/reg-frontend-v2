import { Link } from '@tanstack/react-router'
import Markdown from '~/components/Markdown'
import Button from '~/components/ui/controls/button'
import Splash from '~/components/ui/layout/splash'
import ThankYouImage from '~/images/con-cats/thank-you.png'
import { useTranslations } from '~/localization'

const Success = () => {
  const t = useTranslations()

  return (
    <Splash image={<img src={ThankYouImage} alt="" loading="lazy" />}>
      <h1>{t('payment-success-title')}</h1>
      <Markdown>{t('payment-success-text')}</Markdown>
      <Markdown>{t('payment-success-text2')}</Markdown>
      <p>
        <strong>{t('payment-success-warning')}</strong>
      </p>
      <Link to="/register">
        <Button>{t('payment-success-button-label')}</Button>
      </Link>
    </Splash>
  )
}

export default Success
