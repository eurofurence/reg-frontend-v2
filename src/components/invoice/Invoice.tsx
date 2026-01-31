/*
 * Implements the blue invoice on the right side of most funnel pages.
 * Automatically calculates total price figure.
 */

import styled from '@emotion/styled'
import { useState } from 'react'
import Button from '~/components/ui/controls/button'
import Spinner from '~/components/ui/controls/spinner'
import * as MediaQueries from '~/components/ui/media-queries'
import Card from '~/components/ui/surfaces/card'
import config from '~/config'
import { useTranslations } from '~/localization'
import type { Invoice as InvoiceModel } from '~/types/invoice'
import InvoiceItem from './InvoiceItem'
import InvoiceTotalItem from './InvoiceTotalItem'

const InvoiceCard = styled(Card)<{ readonly showOnMobile?: boolean }>`
	@media ${MediaQueries.laptop}, ${MediaQueries.desktop} {
		align-self: start;
	}

	@media ${MediaQueries.phone}, ${MediaQueries.tablet} {
		display: ${({ showOnMobile = false }) => (showOnMobile ? 'unset' : 'none')};
	}
`

const EditLink = styled.p`
	color: var(--color-brand-2-100);
	font-size: 1.4rem;

	:not(:first-of-type) {
		margin-top: 0em;
	}
`

const PayButton = styled(Button)<{ readonly paymentStarted: boolean }>`
	margin-top: 1.5em;
	width: 100%;
	gap: 0.5em;
	cursor: ${({ paymentStarted }) => (paymentStarted ? 'wait' : 'pointer')};
`

const SepaButton = styled(Button)`
	margin-top: 1.5em;
	width: 100%;
	gap: 0.5em;
`

const UnprocessedPayments = styled.p`
	text-align: center;
`

const DisabledPayments = styled.p`
	text-align: center;
`

export interface InvoiceProps {
  readonly title: string
  readonly invoice: InvoiceModel
  readonly showOnMobile?: boolean
  readonly editLink?: string
  readonly onPay?: () => void
  readonly onSepa?: () => void
  readonly unprocessedPayments?: boolean
}

// eslint-disable-next-line complexity
const Invoice = ({
  title,
  invoice,
  showOnMobile,
  editLink,
  onPay,
  onSepa,
  unprocessedPayments = false,
}: InvoiceProps) => {
  const t = useTranslations()

  const getItemName = (id: string, options?: Record<string, any>): string => {
    const translationKey = `invoice-item-definition-${id}.name`

    // Try to get the translated name
    const translatedName = t(translationKey)

    // If the translation key doesn't exist, fall back to a readable version
    if (translatedName === translationKey) {
      return id.replace(/register-ticket-(type|addons)-/g, '').replace(/-/g, ' ')
    }

    // Handle special cases like t-shirt sizes
    if (id === 'register-ticket-addons-tshirt' && options?.size) {
      return `${translatedName} (${options.size})`
    }

    return translatedName
  }
  const [paymentStarted, setPaymentStarted] = useState(false)

  const pay = () => {
    setPaymentStarted(true)
    onPay!()
  }

  const sepa = () => {
    onSepa!()
  }

  const resolveTranslation = (key: string) => {
    const fullKey = `${key}.name`
    const value = t(fullKey)
    return value === fullKey ? t(key) : value
  }

  const extraText = t('invoice-total.extra')

  const disableCCPayments = config.disableCCPayments
  const disableSEPAPayments = config.disableSEPAPayments

  return (
    <InvoiceCard inverted={true} showOnMobile={showOnMobile}>
      <header>
        <h1>{title}</h1>
        {editLink === undefined ? undefined : (
          <EditLink>
            <a href={editLink}>Edit selection</a>
          </EditLink>
        )}
      </header>
      <section>
        <ul>
          {invoice.items.map(({ id, options, amount, totalPrice }) => (
            <InvoiceItem
              key={id}
              amount={amount}
              name={getItemName(id, options)}
              price={totalPrice}
            />
          ))}
        </ul>
      </section>
      <section>
        <ul>
          <InvoiceTotalItem
            type="price"
            name={resolveTranslation('invoice-total')}
            value={invoice.totalPrice}
            extra={extraText === 'invoice-total.extra' ? undefined : extraText}
          />
          {invoice.paid === undefined ||
          invoice.paid === 0 ||
          invoice.due === undefined ||
          invoice.due === 0 ? undefined : (
            <InvoiceTotalItem
              type="due"
              name={resolveTranslation('invoice-paid')}
              value={invoice.paid}
            />
          )}
          {invoice.due === undefined || invoice.due === 0 ? undefined : (
            <InvoiceTotalItem
              type="due"
              name={resolveTranslation('invoice-due')}
              warn={true}
              value={invoice.due}
            />
          )}
        </ul>
        {invoice.due === undefined || invoice.due === 0 ? undefined : unprocessedPayments ? (
          <UnprocessedPayments>{t('invoice-unprocessed-payments')}</UnprocessedPayments>
        ) : disableCCPayments ? (
          <DisabledPayments>{t('invoice-card-disabled')}</DisabledPayments>
        ) : (
          <PayButton
            variant="inverted-card"
            paymentStarted={paymentStarted}
            onClick={paymentStarted || onPay === undefined ? undefined : pay}
          >
            {paymentStarted ? (
              <>
                <Spinner variant="inverted-card-button" />
                {t('invoice-pay-button-loading')}
              </>
            ) : (
              t('invoice-pay-button-credit-card')
            )}
          </PayButton>
        )}
        {invoice.due === undefined ||
        invoice.due === 0 ? undefined : unprocessedPayments ? undefined : disableSEPAPayments ? (
          <DisabledPayments>{t('invoice-sepa-disabled')}</DisabledPayments>
        ) : (
          <SepaButton variant="inverted-card" onClick={onSepa === undefined ? undefined : sepa}>
            {t('invoice-pay-button-sepa')}
          </SepaButton>
        )}
      </section>
    </InvoiceCard>
  )
}

export default Invoice
