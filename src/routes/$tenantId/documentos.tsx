import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/documentos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$tenantId/documentos"!</div>
}
