import NavbarHome from '@/components/NavbarHome';
import { getSessionData } from '@/lib/dal';

export default async function ServerNavbar() {
  const sessionData = await getSessionData('session');
  const mfaVerified = sessionData?.mfaVerified || false;

  return <NavbarHome mfaVerified={mfaVerified} />;
}