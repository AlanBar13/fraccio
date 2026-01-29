import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/anuncios')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenantId/anuncios"!</div>
}
