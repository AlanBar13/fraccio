import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/casa')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Casa</h1>
    </div>
  )
}
