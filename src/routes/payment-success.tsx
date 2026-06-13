import { createFileRoute } from '@tanstack/react-router'
import Success from '~/components/funnels/payment/success'

export const Route = createFileRoute('/payment-success')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Success />
}
