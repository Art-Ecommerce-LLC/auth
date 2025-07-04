import { ResetPasswordForm } from "@/components/form/ResetPasswordForm"
import { getSessionData } from "@/lib/dal"

export default async function ResetPasswordPage() {


  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <ResetPasswordForm/>
        </div>        
    </main>
  );
}
