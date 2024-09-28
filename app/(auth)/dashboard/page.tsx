'server only';

import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import { redirect } from 'next/navigation';
import { getSessionData } from '@/lib/dal';
import NavbarDashServer from '@/components/NavbarDashServer';
export default async function Dashboard() {
  const session = await getSessionData('session');
  if (!session.mfaVerified) {
    redirect('/sign-in');
  }
  if ('role' in session.user && session.user.role === 'ADMIN') {
    return <div>
              <NavbarDashServer />
              <AdminDashboard user={session.user}/>
          </div>
  } else if ('role' in session.user && session.user.role === 'USER') {
    return <div>
            <NavbarDashServer />
            <UserDashboard user={session.user}/>
           </div>
  } else {
    redirect('/sign-in');
  }
}
