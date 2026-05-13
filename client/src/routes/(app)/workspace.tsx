import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { isAuthenticated } from '@/services/authSession'

export const Route = createFileRoute('/(app)/workspace')({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: WorkspaceLayout,
})

function WorkspaceLayout() {
  return <Outlet />
}
