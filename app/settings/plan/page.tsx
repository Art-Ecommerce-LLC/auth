import ChangeRoleWidget from '@/components/ChangeRoleWidget';
import { getSessionData } from '@/lib/dal';
import NavbarDashServer from '@/components/NavbarDashServer';
import ChangePlan from '@/components/ChangePlanClient';

export default async function PlanSettings() {
  const session = await getSessionData('session');

  return (
    <>
      <NavbarDashServer />
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-4">Plan &amp; Billing</h1>

        <ChangePlan
          currentRole={session.role!}
          planStatus={session.planStatus!}
          periodEnd={session.currentPeriodEnd!}
        />

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Change Your Role</h2>
          <ChangeRoleWidget
            currentRole={session.role!}
          />
        </section>
      </main>
    </>
  );
}
