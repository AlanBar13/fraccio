import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/pagos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenantId/pagos"!</div>
}
