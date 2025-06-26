// app/dashboard/page.tsx
import { requirePaidUser } from '@/lib/require-paid'
import NavbarDashServer  from '@/components/NavbarDashServer'
import AdminDashboard    from '@/components/AdminDashboard'
import UserDashboard     from '@/components/UserDashboard'
import PermitServer      from '@/components/PermitServer'

export default async function Dashboard() {
  const user = await requirePaidUser()

  return (
    <>
      <NavbarDashServer />

      {user.role === 'ADMIN'
        ? <AdminDashboard />
        : <UserDashboard />
      }

      {/* this will fetch + render the client grid/map */}
      <PermitServer userId={user.id} />
    </>
  )
}
