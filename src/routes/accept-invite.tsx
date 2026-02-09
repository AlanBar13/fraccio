import Signup from '@/components/Signup'
import { getInviteFn, removeInviteFn } from '@/lib/invites'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accept-invite')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
    }
  },
  loaderDeps: ({ search: { token } }) => ({ token }),
  loader: async ({ deps: { token } }) => {
    const invite = await getInviteFn({ data: { token } })
    if ( invite?.expires_at && new Date(invite.expires_at) < new Date() ) {
      await removeInviteFn({ data: { token } })
      return { invite: null }
    }
    return { invite }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { invite } = Route.useLoaderData()

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {invite ? (
        <Signup invite={invite} />
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invitación no válida o expirada</h1>
          <p className="mt-4 text-gray-600">La invitación que estás intentando usar no es válida o ha expirado. Por favor, contacta al administrador para obtener una nueva invitación.</p>
        </div>
      )}
    </div>
  )
}
