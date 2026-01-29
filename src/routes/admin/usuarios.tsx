import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/usuarios')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/usuarios"!</div>
}
