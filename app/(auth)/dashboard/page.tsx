// app/dashboard/page.tsx
import { requirePaidUser } from '@/lib/require-paid'
import NavbarDashServer from '@/components/NavbarDashServer'
import AdminDashboard from '@/components/AdminDashboard'
import UserDashboard from '@/components/UserDashboard'

export default async function Dashboard() {
  const user = await requirePaidUser()

  if (user.role === 'ADMIN') {
    return (
      <>
        <NavbarDashServer />
        <AdminDashboard />
      </>
    )
  }

  return (
    <>
      <NavbarDashServer />
      <UserDashboard />
    </>
  )
}
