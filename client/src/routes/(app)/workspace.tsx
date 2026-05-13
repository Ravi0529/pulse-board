import { createFileRoute, redirect } from '@tanstack/react-router'

import { isAuthenticated } from '@/services/authSession'

export const Route = createFileRoute('/(app)/workspace')({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/workspace"!</div>
}
