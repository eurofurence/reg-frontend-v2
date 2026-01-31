import { createFileRoute } from '@tanstack/react-router'
import Failure from '~/components/funnels/payment/failure'

export const Route = createFileRoute('/payment-failure' as any)({
  component: RouteComponent,
})

function RouteComponent() {
  return <Failure />
}
