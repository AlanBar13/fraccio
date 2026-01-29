import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { tenant, user } = Route.useRouteContext()
  return <div>
    Hello {tenant.name}!
    <p>Bienvenido {user.full_name} ({user.email}) ({user.role})</p>
    </div>
}
