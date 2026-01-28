import { Button } from '@/components/ui/button'
import { getTenantFn } from '@/lib/tenants'
import { getUser, logoutFn } from '@/lib/user'
import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenantId/')({
  beforeLoad: async ({ params }) => {
    try {
          const tenant = await getTenantFn({ data: { path: params.tenantId } })
          if (!tenant) {
            throw redirect({ to: '/not-found' })
          }

          const user = await getUser()
          console.log('Loaded tenant and user:', user)
          if (user.tenantId !== tenant.id) {
            throw redirect({ to: '/user-not-in-fracc' })
          }

          return { tenant, user }
        } catch (error) {
          if (isRedirect(error)) throw error
          throw redirect({ to: '/login' })
        }
  },
  component: RouteComponent,
  head: async ({ params }) => {
    const tenant = await getTenantFn({ data: { path: params.tenantId } })
    return {
      meta: [
        {
          title: `${tenant.name} | Fraccio`
        }
      ]
    }
  }
})

function RouteComponent() {
  const { tenant, user } = Route.useRouteContext()
  const logout = async () => {
    try {
      await logoutFn()
      console.log('User logged out successfully')
      return redirect({ to: '/login' })
    } catch (error) {
      console.error('Logout error:', error)
      throw redirect({ to: '/login' })
    }
  }
  return <div>
    Hello {tenant.name}!
    <p>Bienvenido {user.full_name} ({user.email}) ({user.role})</p>
    <Button onClick={() => logout()}>Logout</Button>
    </div>
}
