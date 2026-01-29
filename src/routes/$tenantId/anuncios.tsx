import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/anuncios')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  return <div>Hello "/$tenantId/anuncios"! {JSON.stringify(user)}</div>
}
