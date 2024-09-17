import { ResetPasswordForm } from "@/components/form/ResetPasswordForm"
import { verifyDatabaseSession} from "@/lib/dto";

export default async function ResetPasswordPage() {

  // Validate the session token from the URL

  const searchParams = new URLSearchParams(window.location.search);
  const sessionToken = searchParams.get('session');

  if (!sessionToken) {
    // Redirect to the login page
    window.location.href = '/forgot-password';
    return;
  }
  const isVerified = await verifyDatabaseSession(sessionToken);

  if (!isVerified) {
    // Redirect to the login page
    window.location.href = '/forgot-password';
    return;
  }

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <ResetPasswordForm/>
        </div>        
    </main>
  );
}
