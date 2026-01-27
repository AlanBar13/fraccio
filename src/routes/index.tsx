import { createFileRoute, isRedirect } from '@tanstack/react-router'
import { getUser } from '../lib/user'
import { redirect } from '@tanstack/react-router'
import NotFound from '@/components/ui/NotFound'

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: async () => {
    try {
      const data = await getUser()
      return data
    } catch (error) {
      if (isRedirect(error)) throw error
      throw redirect({ to: '/login' })
    }
  },
  notFoundComponent: () => <NotFound />
})

function App() {
  const data = Route.useRouteContext()
  return (
    <div className="min-h-screen">
      <h1>Fraccio</h1>
      <p>Bienvenido {data.email}</p>
    </div>
  )
}
