import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/usuarios')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenantId/usuarios"!</div>
}
