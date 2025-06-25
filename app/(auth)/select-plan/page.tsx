
import { redirect } from 'next/navigation';
import { getSessionData } from '@/lib/dal';
import { PlanSelectionForm } from '@/components/form/PlanSelectionForm';

export default async function SelectPlanPage() {
    const session = await getSessionData('session');
    if (!session.mfaVerified) {
        redirect('/sign-in');
      }
    if ('role' in session.user && session.user.role !== 'USER') {
        redirect('/dashboard');
    }

    return (
        <>
         <PlanSelectionForm />
        </>
    );
}