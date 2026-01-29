import { SidebarNav } from '@/components/navigation'
import { getUser, logoutFn } from '@/lib/user'
import { createFileRoute, isRedirect, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { Building, House, Users } from 'lucide-react'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
        try {
            const user = await getUser()
            if (user.role !== "superadmin") {
                throw redirect({ to: '/user-not-in-fracc' })
            }

            return { user }
        } catch (error) {
            if (isRedirect(error)) throw error
            throw redirect({ to: '/login' })
        }
    },
  component: RouteComponent,
  head: () => ({
    meta: [
        { title: 'Admin Dashboard | Fraccio' }
    ]
  })
})

function RouteComponent() {
  const route = useRouter()
    const onRouteChange = (path: string) => {
        route.navigate({ to: `/admin/${path}` })
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
            <aside className="w-55 border-r border-border/50 bg-card p-4">
                <SidebarNav items={[
                    { id: '1', label: 'Dashboard', onClick: () => onRouteChange('/'), icon: <House /> },
                    { id: '2', label: 'Fraccionamientos', onClick: () => onRouteChange('/fraccionamientos'), icon: <Building /> },
                    { id: '3', label: 'Usuarios', onClick: () => onRouteChange('/usuarios'), icon: <Users /> },
                    { id: '4', label: 'Cerrar Sesión', onClick: () => onLogout() },
                ]} />
            </aside>
            <main className="flex-1 overflow-auto bg-background p-6">
                <Outlet />
            </main>
        </div>
    )
}
