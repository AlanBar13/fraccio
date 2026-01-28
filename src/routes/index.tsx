import { createFileRoute } from '@tanstack/react-router'
import NotFound from '@/components/ui/NotFound'

export const Route = createFileRoute('/')({
  component: App,
  notFoundComponent: () => <NotFound />
})

function App() {
  return (
    <div className="min-h-screen">
      <h1>Fraccio</h1>
    </div>
  )
}
