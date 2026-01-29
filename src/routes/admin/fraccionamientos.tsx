import FraccContainer from '@/components/admin/FraccContainer'
import { listTenantsFn } from '@/lib/tenants'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/fraccionamientos')({
  loader: async () => {
    const tenants = await listTenantsFn()
    return { tenants }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return (
    <div>
      <h1 className='text-2xl font-bold'>Fraccionamientos</h1>
      <div className='mt-4'>
        <FraccContainer tenants={data.tenants} />
      </div>
    </div>
  )
}
