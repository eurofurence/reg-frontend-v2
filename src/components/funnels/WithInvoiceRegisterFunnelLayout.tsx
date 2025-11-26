/*
 * Layout for registration funnel pages that has a blue invoice on the right side.
 */

import styled from '@emotion/styled'
import type { ReactNode } from 'react'
import StepFunnelLayout from '~/components/funnels/StepFunnelLayout'
import Invoice from '~/components/invoice/Invoice'
import * as MediaQueries from '~/components/ui/media-queries'
import config from '~/config'
import { useTranslations } from '~/localization'
import {
  useInitiateCreditCardPayment,
  useInitiateSepaPayment,
  useRegistrationQuery,
} from '~/registration/hooks'
import type { RegistrationInfo } from '~/registration/types'
import { isApproved } from '~/registration/types'
import type { UncalculatedInvoiceItem } from '~/types/invoice'
import { buildInvoice } from '~/types/invoice'
import { TOTAL_STEPS } from './constants'
import RegisterHeader from './RegisterHeader'

const Grid = styled.div`
	display: grid;

	@media ${MediaQueries.phone}, ${MediaQueries.tablet} {
		grid-template-columns: 1fr;
		gap: 5em;
	}

	@media ${MediaQueries.laptop}, ${MediaQueries.desktop} {
		grid-template-columns: auto 254px;
		gap: 111px;
	}
`

export interface WithInvoiceRegisterFunnelLayoutProps {
  readonly children: ReactNode
  readonly currentStep: number
  readonly onNext?: () => void
}

const buildInvoiceItems = (
  registrationInfo: Partial<RegistrationInfo>,
): UncalculatedInvoiceItem[] => {
  const items: UncalculatedInvoiceItem[] = []

  if (!registrationInfo.ticketType || !registrationInfo.ticketLevel) {
    return items
  }

  const { ticketType, ticketLevel } = registrationInfo
  const level = ticketLevel.level ?? 'standard'
  const levelConfig = config.ticketLevels[level as keyof typeof config.ticketLevels]

  if (!levelConfig) {
    return items
  }

  // Add base ticket
  const basePrice =
    ticketType.type === 'day'
      ? (levelConfig.prices.day ?? 0)
      : ticketType.type === 'full'
        ? (levelConfig.prices.full ?? 0)
        : 0

  if (basePrice > 0) {
    const options: Record<string, any> = {}
    if (ticketType.type === 'day' && ticketType.day) {
      options.day = ticketType.day.toISODate()
    }

    items.push({
      id: `register-ticket-type-${ticketType.type}`,
      options,
      amount: 1,
      unitPrice: basePrice,
    })
  }

  // Add addons
  if (ticketLevel.addons) {
    Object.entries(ticketLevel.addons).forEach(([addonId, addonData]) => {
      if (addonData.selected && config.addons[addonId as keyof typeof config.addons]) {
        const addonConfig = config.addons[addonId as keyof typeof config.addons]
        const addonPrice = addonConfig.price ?? 0

        // Skip hidden addons with zero price
        if (addonConfig.hidden && addonPrice === 0) {
          return
        }

        let amount = 1
        const options: Record<string, any> = {}

        // Handle quantity-based addons
        if (addonId === 'benefactor' && addonData.options && 'count' in addonData.options) {
          const countValue = (addonData.options as { count: string }).count
          amount = parseInt(String(countValue).replace('c', ''), 10) || 1
        } else if (addonId === 'fursuitadd' && addonData.options && 'count' in addonData.options) {
          const countValue = (addonData.options as { count: string }).count
          amount = parseInt(String(countValue).replace('c', ''), 10) || 1
        } else if (addonId === 'tshirt' && addonData.options && 'size' in addonData.options) {
          options.size = addonData.options.size
        }

        items.push({
          id: `register-ticket-addons-${addonId}`,
          options,
          amount,
          unitPrice: addonPrice,
        })
      }
    })
  }

  return items
}

const WithInvoiceRegisterFunnelLayout = ({
  children,
  currentStep,
  onNext,
}: WithInvoiceRegisterFunnelLayoutProps) => {
  const { data } = useRegistrationQuery()
  const creditCardMutation = useInitiateCreditCardPayment()
  const sepaMutation = useInitiateSepaPayment()
  const t = useTranslations()
  const registration = data?.registration
  const isEditMode = registration && registration.status !== 'unsubmitted'
  const approvedRegistration = registration && isApproved(registration) ? registration : undefined

  const invoiceItems = registration ? buildInvoiceItems(registration.registrationInfo) : []
  const invoice = buildInvoice(
    invoiceItems,
    approvedRegistration
      ? { paid: approvedRegistration.paymentInfo.paid, due: approvedRegistration.paymentInfo.due }
      : {},
  )

  const isFirstPage = currentStep === 0
  const isLastPage = currentStep === TOTAL_STEPS - 1

  // Only enable payments for submitted registrations
  const badgeNumber = approvedRegistration?.id

  return (
    <StepFunnelLayout
      header={<RegisterHeader currentStep={currentStep} />}
      isFirstPage={isFirstPage}
      isLastPage={isLastPage}
      onNext={onNext}
      isEditMode={isEditMode}
    >
      <Grid>
        <div>{children}</div>
        <Invoice
          title={t('register-invoice-layout.invoiceTitle')}
          editLink={
            isEditMode && currentStep === TOTAL_STEPS - 1 ? '/register/ticket/level' : undefined
          }
          invoice={invoice}
          showOnMobile={isLastPage}
          onPay={badgeNumber ? () => creditCardMutation.mutate(badgeNumber) : undefined}
          onSepa={badgeNumber ? () => sepaMutation.mutate(badgeNumber) : undefined}
          unprocessedPayments={approvedRegistration?.paymentInfo.unprocessedPayments ?? false}
        />
      </Grid>
    </StepFunnelLayout>
  )
}

export default WithInvoiceRegisterFunnelLayout
