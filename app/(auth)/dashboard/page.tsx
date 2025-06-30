// app/dashboard/page.tsx
import NavbarDashServer  from '@/components/NavbarDashServer'
import DashboardClient from '@/components/DashboardClient'
import { getSessionData } from '@/lib/dal'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const session = await getSessionData('session')

  // If the session is not  MFA verified, redirect to the home page
  if (!session.isAuth || !session.mfaVerified) {
    redirect('/');
  }

  if (session.role === 'USER') {
    redirect('/select-plan');
  }

  return (
    <>
      <NavbarDashServer />
      <DashboardClient />
    </>
  )
}
