import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components//UserDashboard';
import { redirect } from 'next/navigation';
import { getSessionData } from '@/lib/dal';
import NavbarDashServer from '@/components/NavbarDashServer';
export default async function Dashboard() {


  const session = await getSessionData('session');

  if (!session.mfaVerified) {
    redirect('/sign-in');
  }

  if ('role' in session.user && session.user.role === 'ADMIN') {
    return <>
              <NavbarDashServer />
              <AdminDashboard />
          </>
  } else if ('role' in session.user && session.user.role === 'USER') {
    return <>
            <NavbarDashServer />
            <UserDashboard />
           </>
  } else {
    redirect('/sign-in');
  }
}
