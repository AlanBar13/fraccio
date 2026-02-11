import { SidebarNav } from '@/components/navigation'
import { useToast } from '@/components/notifications'
import { getTenantFn } from '@/lib/tenants'
import { getUser, logoutFn } from '@/lib/user'
import { logger } from '@/utils/logger'
import { createFileRoute, isRedirect, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { Banknote, BookOpen, Building, House, Mail, UserPen } from 'lucide-react'

export const Route = createFileRoute('/$tenantId')({
    beforeLoad: async ({ params }) => {
        try {
            const user = await getUser()
            const tenant = await getTenantFn({ data: { path: params.tenantId } })
            if (!tenant) {
                logger('warn', 'Tenant not found:', { tenantId: params.tenantId })
                throw redirect({ to: '/not-found' })
            }

            // Check if user is superadmin, if it is, allow access
            if (user.role === 'superadmin') {
                return { tenant, user }
            }

            // Check if user belongs to tenant
            if (user.tenantId !== tenant.id) {
                logger('warn', 'User does not belong to tenant:', { userEmail: user.email, tenantId: tenant.id })
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
          title: `${tenant ? tenant.name : 'Fraccionamiento'} | Fraccio`
        }
      ]
    }
  }
})

function RouteComponent() {
    const { addToast } = useToast()
    const { user } = Route.useRouteContext()
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
            logger('error', 'Error during logout:', { error })
            addToast({ type: 'error', description: 'Error al cerrar sesión. Inténtalo de nuevo.', duration: 10000 })
        }
    }

    return (
        <div className="flex h-screen">
            <aside className="w-45 border-r border-border/50 bg-card p-4">
                <SidebarNav role={user.role} items={[
                    { id: '1', label: 'Dashboard', onClick: () => onRouteChange('/'), icon: <Building /> },
                    { id: '2', label: 'Anuncios', onClick: () => onRouteChange('/anuncios'), icon: <Mail /> },
                    { id: '3', label: 'Casa', onClick: () => onRouteChange('/casa'), icon: <House /> },
                    { id: '4', label: 'Pagos', onClick: () => onRouteChange('/pagos'), icon: <Banknote /> },
                    { id: '5', label: 'Documentos', onClick: () => onRouteChange('/documentos'), icon: <BookOpen /> },
                    { id: '6', label: 'Usuarios', onClick: () => onRouteChange('/usuarios'), allowedRoles: ['admin', 'superadmin'], icon: <UserPen /> },
                    { id: '7', label: 'Administrar Casas', onClick: () => onRouteChange('/adminCasas'), allowedRoles: ['admin', 'superadmin'], icon: <Building /> },
                    {
                        id: '8', label: 'Perfil', icon: <UserPen />, children: [
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
