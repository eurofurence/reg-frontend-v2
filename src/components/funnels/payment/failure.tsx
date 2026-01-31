import { Link } from '@tanstack/react-router'
import Markdown from '~/components/Markdown'
import Button from '~/components/ui/controls/button'
import Splash from '~/components/ui/layout/splash'
import DayTicketImage from '~/images/con-cats/ticket-types/day.png'
import { useTranslations } from '~/localization'

const Failure = () => {
  const t = useTranslations()

  return (
    <Splash image={<img src={DayTicketImage} alt="" loading="lazy" />}>
      <h1>{t('payment-failure-title')}</h1>
      <Markdown>{t('payment-failure-text')}</Markdown>
      <Markdown>{t('payment-failure-text2')}</Markdown>
      <Link to="/register">
        <Button>{t('payment-failure-button-label')}</Button>
      </Link>
    </Splash>
  )
}

export default Failure
