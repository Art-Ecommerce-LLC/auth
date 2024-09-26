import { ResetPasswordForm } from "@/components/form/ResetPasswordForm"
import { validateResetPasswordPage } from "@/lib/dto";

export default async function ResetPasswordPage() {

  await validateResetPasswordPage();

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <ResetPasswordForm/>
        </div>        
    </main>
  );
}
