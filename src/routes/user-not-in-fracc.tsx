import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user-not-in-fracc')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user-not-in-fracc"!</div>
}
