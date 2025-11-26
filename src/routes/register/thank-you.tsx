import { createFileRoute } from '@tanstack/react-router'
import Markdown from '~/components/Markdown'
import Splash from '~/components/ui/layout/splash'
import ThankYouImage from '~/images/con-cats/thank-you.png'
import { useTranslations } from '~/localization'

export const Route = createFileRoute('/register/thank-you')({
  component: RouteComponent,
})

function RouteComponent() {
  const t = useTranslations()

  return (
    <Splash image={<img src={ThankYouImage} alt="" loading="lazy" />}>
      <h1>{t('register-thank-you-title')}</h1>
      <h2>{t('register-thank-you-subtitle')}</h2>
      <Markdown>{t('register-thank-you-content')}</Markdown>
    </Splash>
  )
}
