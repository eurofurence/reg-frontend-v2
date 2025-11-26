import styled from '@emotion/styled'
import { DateTime } from 'luxon'
import { Footer as FooterShell } from '~/components'
import { desktop, laptop, phone, tablet } from '~/components/ui/media-queries'
import config from '~/config'
import { useTranslations } from '~/localization'
import { useRegistrationQuery } from '~/registration/hooks'

const Grid = styled.div`
  display: grid;
  gap: 2rem;

  @media ${laptop}, ${desktop} {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'links saved'
      'links credits';
  }

  @media ${phone}, ${tablet} {
    grid-template-columns: 1fr;
    grid-template-areas:
      'saved'
      'links'
      'credits';
    text-align: center;
  }
`

const Links = styled.nav`
  grid-area: links;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
`

const SaveTime = styled.section`
  grid-area: saved;
  justify-self: end;
  font-size: 1.4rem;
`

const Credits = styled.section`
  grid-area: credits;
  font-size: 1.2rem;
  justify-self: end;
`

const ExternalLink = (props: React.ComponentProps<'a'>) => (
  <a target="_blank" rel="noreferrer noopener" {...props} />
)

const Footer = () => {
  const t = useTranslations()
  const { data } = useRegistrationQuery()
  const lastSaved = data?.lastSavedAt ? DateTime.fromISO(data.lastSavedAt) : null

  return (
    <FooterShell>
      <Grid>
        <SaveTime>{lastSaved ? <p>{t('footer-last-saved', { lastSaved })}</p> : null}</SaveTime>
        <Links>
          <ExternalLink href={config.websiteLinks.privacyStatement}>
            {t('footer-links-privacy-policy')}
          </ExternalLink>
          <ExternalLink href={config.websiteLinks.imprint}>
            {t('footer-links-legal-info')}
          </ExternalLink>
          <ExternalLink href={config.websiteLinks.policies}>
            {t('footer-links-policies')}
          </ExternalLink>
          <ExternalLink href={config.websiteLinks.contact}>
            {t('footer-links-contact')}
          </ExternalLink>
        </Links>
        <Credits>Artwork © 2022 Pan Hesekiel Shiroi</Credits>
      </Grid>
    </FooterShell>
  )
}

export default Footer
