import { Button } from '@/components/ui/button'
import { inviteUserFn } from '@/lib/user'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/usuarios')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Administrar Usuarios</h1>
      <Button onClick={() => inviteUserFn({ data: { email: "alan.g.bardales@gmail.com", tenantId: "6c2b64b5-5fd8-4f10-9a66-5f4254d3ae81" } })}>Inivitar Usuario</Button>
    </div>
  )
}
