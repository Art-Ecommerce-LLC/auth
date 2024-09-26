
import { Button } from '@/components/ui/button';

export default async function PasswordResetNotifyPage() {

  function resendPasswordResetEmail() {
    // Send the email again

  }

  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <p>A link to reset your password has been</p>
            <Button onClick={resendPasswordResetEmail}>ResendPasswordLink</Button>
        </div>        
    </main>
  );
}
