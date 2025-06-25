// app/settings/plan/page.tsx
import { requirePaidUser } from '@/lib/require-paid'
import NavbarDashServer from '@/components/NavbarDashServer'
import ChangePlan from '@/components/ChangePlanClient'

export default async function PlanSettings() {
  const user = await requirePaidUser()

  return (
    <>
      <NavbarDashServer />
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-4">Plan &amp; Billing</h1>
        <ChangePlan currentRole={user.role} />
      </main>
    </>
  )
}
