import NavbarDash from '../components//NavbarDash';
import { getSessionData } from '@/lib/dal';
import {redirect} from 'next/navigation';

export default async function NavbarDashServer() {
  const sessionData = await getSessionData('session');
  if (!sessionData.mfaVerified) {
    console.log(sessionData);
    redirect('/');
  }
  return <NavbarDash mfaVerified={sessionData.mfaVerified} />;
}