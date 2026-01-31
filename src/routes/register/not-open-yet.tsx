import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Markdown from '~/components/Markdown'
import BrandImage from '~/components/ui/assets/brand.svg'
import Splash from '~/components/ui/layout/splash'
import { useTranslations } from '~/localization'

export const Route = createFileRoute('/register/not-open-yet')({
  component: RouteComponent,
})

function RouteComponent() {
  const t = useTranslations()
  const navigate = useNavigate()

  return (
    <Splash image={<img src={BrandImage} alt="" loading="lazy" />}>
      <h1>{t('register-not-open-yet-title')}</h1>
      <Markdown>{t('register-not-open-yet-content')}</Markdown>

      <button
        type="button"
        onClick={() => navigate({ href: '/' })}
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '999px',
          border: 'none',
          backgroundColor: 'var(--color-brand-2-500, #1f2937)',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Go back home
      </button>
    </Splash>
  )
}
