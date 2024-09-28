import NavbarDash from '@/components/NavbarDash';
import { getSessionData } from '@/lib/dal';

export default async function NavbarDashServer() {
  const sessionData = await getSessionData('session');
  const mfaVerified = sessionData?.mfaVerified || false;

  return <NavbarDash mfaVerified={mfaVerified} />;
}