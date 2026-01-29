import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/fraccionamientos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/fraccionamientos"!</div>
}
