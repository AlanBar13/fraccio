import { SidebarNav } from '@/components/navigation'
import { getTenantFn } from '@/lib/tenants'
import { getUser, logoutFn } from '@/lib/user'
import { createFileRoute, isRedirect, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { Banknote, BookOpen, Building, House, Mail, UserPen } from 'lucide-react'

export const Route = createFileRoute('/$tenantId')({
    beforeLoad: async ({ params }) => {
        try {
            const tenant = await getTenantFn({ data: { path: params.tenantId } })
            if (!tenant) {
                throw redirect({ to: '/not-found' })
            }

            const user = await getUser()
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
    const route = useRouter()
    const params = Route.useParams()

    const onRouteChange = (path: string) => {
        route.navigate({ to: `/${params.tenantId}${path}` })
    }

    const onLogout = async () => {
        try {
            await logoutFn()
            route.navigate({ to: '/login', replace: true })
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <div className="flex h-screen">
            <aside className="w-45 border-r border-border/50 bg-card p-4">
                <SidebarNav items={[
                    { id: '1', label: 'Dashboard', onClick: () => onRouteChange('/'), icon: <Building /> },
                    { id: '2', label: 'Anuncios', onClick: () => onRouteChange('/anuncios'), icon: <Mail /> },
                    { id: '3', label: 'Casa', onClick: () => onRouteChange('/casa'), icon: <House /> },
                    { id: '4', label: 'Pagos', onClick: () => onRouteChange('/pagos'), icon: <Banknote /> },
                    { id: '5', label: 'Documentos', onClick: () => onRouteChange('/documentos'), icon: <BookOpen /> },
                    {
                        id: '7', label: 'Perfil', icon: <UserPen />, children: [
                            { id: '7.1', label: 'Ver Perfil', onClick: () => onRouteChange('/perfil') },
                            { id: '7.2', label: 'Cerrar Sesión', onClick: () => onLogout() }
                        ]
                    },
                ]} />
            </aside>
            <main className="flex-1 overflow-auto bg-background p-6">
                <Outlet />
            </main>
        </div>
    )
}
