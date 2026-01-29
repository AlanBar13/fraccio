import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/casa')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenantId/casa"!</div>
}
