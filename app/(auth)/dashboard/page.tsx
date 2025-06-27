// app/dashboard/page.tsx
import NavbarDashServer  from '@/components/NavbarDashServer'
import AdminDashboard    from '@/components/AdminDashboard'
import UserDashboard     from '@/components/UserDashboard'
import PermitServer      from '@/components/PermitServer'
import { getSessionData } from '@/lib/dal'

export default async function Dashboard() {
  const session = await getSessionData('session')

  return (
    <>
      <NavbarDashServer />

      {session.role === 'ADMIN'
        ? <AdminDashboard />
        : <UserDashboard />
      }

      {/* this will fetch + render the client grid/map */}
      <PermitServer userId={session.userId!} />
    </>
  )
}
