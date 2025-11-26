import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { captureException } from '@sentry/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import WithInvoiceRegisterFunnelLayout from '~/components/funnels/WithInvoiceRegisterFunnelLayout'
import Checkbox from '~/components/ui/controls/forms/checkbox'
import Form from '~/components/ui/layout/form'
import { useCurrentLocale, useTranslations } from '~/localization'
import { hasDraftRegistrationInfo } from '~/registration/autosave'
import { useRegistrationQuery, useSubmitRegistrationMutation } from '~/registration/hooks'
import type { RegistrationInfo, RegistrationStatus } from '~/registration/types'
import { addRegistrationBreadcrumb } from '~/util/sentry'
import config from '../../config'

export const Route = createFileRoute('/register/summary')({
  component: RouteComponent,
})

interface PropertyDefinition {
  readonly id: string
  readonly value: string
  readonly wide?: boolean
}

interface SectionProps {
  readonly id: string
  readonly editLink: string
  readonly properties: readonly PropertyDefinition[]
  readonly status?: RegistrationStatus
}

const SectionContainer = styled.section<{ readonly status: string }>`
	display: grid;

	${({ status }) =>
    status === 'cancelled'
      ? css`
			grid: "title" auto
			      "spacer" 2em
			      "props" auto
			      / 1fr;
		`
      : css`
			@media not all and (min-width: 1050px) {
				grid: "title" auto
				      "edit" auto
				      "spacer" 2em
				      "props" auto
				      / 273px auto;
			}

			@media (min-width: 1050px) {
				grid: "title title" auto
				      "edit  props" auto
				      / 273px auto;
			}
		`}

	&:not(:last-of-type) {
		border-bottom: 1px solid var(--color-grays-200);
		padding-bottom: 2em;
	}
`

const SectionTitle = styled.h4`
	grid-area: title;
`

const PropertyList = styled.dl`
	grid-area: props;

	display: grid;
	grid: auto / repeat(2, 1fr);
	grid-row-gap: 2em;
`

const Property = styled.div<{ readonly wide: boolean }>`
	grid-column: span ${({ wide }) => (wide ? 2 : 1)};
`

const PropertyName = styled.dt`
	font-weight: 400;
	font-size: 12px;

	color: var(--color-brand-2-500);
`

const PropertyDescription = styled.dd``

const TermsForm = styled(Form)`
	margin-top: 5em;
`

const StatusText = styled.p<{ readonly status: string }>`
	color: ${({ status }) => (status === 'cancelled' ? 'var(--color-semantic-error)' : 'unset')};
`

const RegistrationId = styled.p`
	font-weight: 400;
	font-size: 12px;

	color: var(--color-grays-400);

	&:not(:first-of-type) {
		margin-top: 2em;
	}
`

const Section = ({
  id: sectionId,
  editLink,
  properties,
  status = 'unsubmitted',
}: SectionProps & { status?: string }) => {
  const t = useTranslations()
  return (
    <SectionContainer status={status}>
      <SectionTitle>{t(`register-summary-section-${sectionId}-title`)}</SectionTitle>
      {status === 'cancelled' ? undefined : (
        <a href={editLink} style={{ gridArea: 'edit' }}>
          {t('register-summary-edit')}
        </a>
      )}
      <PropertyList>
        {properties.map(({ id, value, wide = false }) => (
          <Property key={id} wide={wide}>
            <PropertyName>
              {t(`register-summary-section-${sectionId}-property-${id}-name`)}
            </PropertyName>
            <PropertyDescription>{value}</PropertyDescription>
          </Property>
        ))}
      </PropertyList>
    </SectionContainer>
  )
}

function RouteComponent() {
  const { data, isLoading } = useRegistrationQuery()
  const navigate = useNavigate()
  const submitMutation = useSubmitRegistrationMutation()
  const t = useTranslations()
  const currentLocale = useCurrentLocale()

  const registration = data?.registration
  const info = registration?.registrationInfo
  const isEditMode = registration && registration.status !== 'unsubmitted'

  useEffect(() => {
    if (!isLoading && !hasDraftRegistrationInfo(info)) {
      navigate({ to: '/register/ticket/type' as any })
    }
  }, [info, isLoading, navigate])

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: { rulesAndConditionsAccepted: false },
  })

  if (isLoading) {
    return <div>{t('common-loading')}</div>
  }

  if (data?.isOpen === false) {
    return <div>{t('register-not-open-yet-title')}</div>
  }

  if (!registration) {
    return <div>{t('register-summary-no-draft-available')}</div>
  }

  // Show registration regardless of status (draft or existing)
  // isEditMode determines if it's read-only or editable

  const normalizedInfo = (info ?? {}) as Partial<RegistrationInfo>
  const personalInfo = normalizedInfo.personalInfo!
  const contactInfo = normalizedInfo.contactInfo!
  const optionalInfo = normalizedInfo.optionalInfo!

  const notificationNames = Object.entries(optionalInfo.notifications)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type)
    .join(', ')

  const onSubmit = () => {
    addRegistrationBreadcrumb('summary', 'final-submission', {
      hasPersonalInfo: Boolean(normalizedInfo.personalInfo),
      hasContactInfo: Boolean(normalizedInfo.contactInfo),
      ticketType: normalizedInfo.ticketType?.type,
      ticketLevel: normalizedInfo.ticketLevel?.level,
    })
    const registrationData = {
      ...normalizedInfo,
      preferredLocale: currentLocale,
    }

    submitMutation.mutate(registrationData as RegistrationInfo, {
      onSuccess: () => {
        navigate({ to: '/register/thank-you' as any })
      },
      onError: (error) => {
        console.error('Registration submission failed:', error)

        captureException(error, {
          level: 'error',
          tags: { flow: 'registration', step: 'submit' },
          extra: {
            reason: 'Registration submission failed',
            registrationData,
          },
        })

        alert(`Registration submission failed: ${error.message || 'Unknown error'}`)
      },
    })
  }

  return (
    <WithInvoiceRegisterFunnelLayout
      onNext={isEditMode ? undefined : handleSubmit(onSubmit)}
      currentStep={5}
    >
      <Form>
        <h3>{t(`register-summary-title-${isEditMode ? 'edit' : 'initial'}`)}</h3>

        <StatusText status={registration.status}>
          {(() => {
            const status = registration.status as RegistrationStatus
            switch (status) {
              case 'unsubmitted':
                return t('register-summary-registration-status-unsubmitted')
              case 'new':
                return t('register-summary-registration-status-new')
              case 'approved':
                return t('register-summary-registration-status-approved')
              case 'partially-paid':
                return t('register-summary-registration-status-partially-paid')
              case 'paid':
                return t('register-summary-registration-status-paid')
              case 'checked-in':
                return t('register-summary-registration-status-checked-in')
              case 'cancelled':
                return t('register-summary-registration-status-cancelled')
              case 'waiting':
                return t('register-summary-registration-status-waiting')
              default:
                return t('register-summary-registration-status-unsubmitted')
            }
          })()}
        </StatusText>

        {'id' in registration && typeof registration.id === 'number' && (
          <RegistrationId>
            {t('register-summary-registration-id', { registrationId: registration.id })}
          </RegistrationId>
        )}

        <Section
          id="personal"
          editLink="/register/personal-info"
          status={registration.status}
          properties={[
            { id: 'nickname', value: personalInfo.nickname },
            { id: 'full-name', value: `${personalInfo.firstName} ${personalInfo.lastName}` },
            {
              id: 'pronouns',
              value: personalInfo.pronouns ?? '',
            },
            {
              id: 'date-of-birth',
              value: personalInfo.dateOfBirth.toLocaleString({ dateStyle: 'long' }),
            },
            {
              id: 'wheelchair-accomodation',
              value: t(
                personalInfo.wheelchair
                  ? 'register-summary-boolean-value-true'
                  : 'register-summary-boolean-value-false',
              ),
            },
            {
              id: 'spoken-languages',
              wide: true,
              value: personalInfo.spokenLanguages.join(', '),
            },
          ]}
        />
        <Section
          id="contact"
          editLink="/register/contact"
          status={registration.status}
          properties={[
            { id: 'email', wide: true, value: contactInfo.email },
            { id: 'phone-number', wide: true, value: contactInfo.phoneNumber },
            { id: 'street', wide: true, value: contactInfo.street },
            { id: 'city', value: contactInfo.city },
            { id: 'postal-code', value: contactInfo.postalCode },
            { id: 'state-or-province', value: contactInfo.stateOrProvince ?? '' },
            {
              id: 'country',
              value: contactInfo.country,
            },
          ]}
        />
        <Section
          id="optional"
          editLink="/register/optional"
          status={registration.status}
          properties={[
            { id: 'notifications', wide: true, value: notificationNames },
            {
              id: 'digital-conbook',
              wide: true,
              value: t(
                optionalInfo.digitalConbook
                  ? 'register-summary-boolean-value-true'
                  : 'register-summary-boolean-value-false',
              ),
            },
            { id: 'comments', wide: true, value: optionalInfo.comments ?? '' },
          ]}
        />

        {isEditMode ? undefined : (
          <TermsForm>
            <Checkbox
              gridSpan={10}
              {...register('rulesAndConditionsAccepted', {
                required: t(
                  'register-summary-validation-errors-rules-and-conditions-accepted-required',
                ),
              })}
            >
              <span>
                I accept the{' '}
                <a target="_blank" rel="noreferrer noopener" href={config.websiteLinks.rules}>
                  rules
                </a>{' '}
                and{' '}
                <a target="_blank" rel="noreferrer noopener" href={config.websiteLinks.terms}>
                  conditions
                </a>
                .
              </span>
            </Checkbox>
            {errors.rulesAndConditionsAccepted?.message && (
              <div style={{ color: 'red' }}>{errors.rulesAndConditionsAccepted.message}</div>
            )}
          </TermsForm>
        )}
      </Form>
    </WithInvoiceRegisterFunnelLayout>
  )
}
