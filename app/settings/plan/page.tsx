// app/settings/plan/page.tsx
import { getSessionData } from '@/lib/dal'
import NavbarDashServer from '@/components/NavbarDashServer'
import ChangePlan from '@/components/ChangePlanClient'

export default async function PlanSettings() {
  const session = await getSessionData('session');   // now already has role, planStatus, currentPeriodEnd
  console.log("PlanSettings session:", session);
  return (
    <>
      <NavbarDashServer />
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-4">Plan &amp; Billing</h1>

        {/*  NEW props */}
        <ChangePlan
          currentRole={session.role!}
          planStatus={session.planStatus!}
          periodEnd={session.currentPeriodEnd!}
        />
      </main>
    </>
  )
}
