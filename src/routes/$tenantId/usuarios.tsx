import UsersContainer from '@/components/admin/UsersContainer'
import { getHousesFn } from '@/lib/houses'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/usuarios')({
  loader: async ({ context }) => {
    const houses = await getHousesFn({ data: { tenantId: context.tenant.id } })

    return { houses }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { tenant } = Route.useRouteContext()
  const { houses } = Route.useLoaderData()
  return (
    <div>
      <h1 className="text-2xl font-bold">Administrar Usuarios</h1>
      <UsersContainer tenantId={tenant.id} houses={houses} />
    </div>
  )
}
